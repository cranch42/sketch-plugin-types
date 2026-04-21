# Building with skpm

[`skpm`](https://github.com/skpm/skpm) is the standard Sketch plugin toolchain. It scaffolds a project, bundles your code (webpack + babel), installs the plugin into Sketch, watches files on save, and publishes releases.

## Setup

Install skpm once, globally:

```sh
npm install -g skpm
```

Create a new plugin:

```sh
skpm create my-plugin
cd my-plugin
npm install
```

You get a plugin folder:

```
my-plugin/
  src/
    manifest.json        source manifest
    my-command.js        one file per command
  assets/                icons and other resources
  package.json           has an "skpm" field pointing at src/manifest.json
```

## Add TypeScript

```sh
npm install --save-dev typescript sketch-plugin-types
```

Rename your source files from `.js` to `.ts`, drop an `env.d.ts` into `src/`:

```ts
// src/env.d.ts
/// <reference types="sketch-plugin-types" />
import 'sketch-plugin-types/globals';
```

`src/manifest.json` keeps pointing at the `.js` output (skpm writes `.js` regardless of source extension):

```json
{
  "commands": [
    { "script": "my-command.js", "handler": "onRun", "...": "..." }
  ]
}
```

In principle `@skpm/builder` hands `.ts` sources to Babel and they compile without extra config. In practice, on `@skpm/builder@0.9.5` TypeScript is not always picked up, and the failure mode is silent — the `.ts` file is either ignored or emitted as-is and crashes in Sketch. If you hit that, drop a `webpack.skpm.config.js` next to `package.json` and wire `ts-loader` explicitly:

```js
// webpack.skpm.config.js
module.exports = function (config, _isPluginCommand) {
  config.module = config.module || {};
  config.module.rules = config.module.rules || [];
  config.module.rules.push({
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: [{ loader: 'ts-loader', options: { transpileOnly: true } }],
  });
  config.resolve = config.resolve || {};
  config.resolve.extensions = [
    '.ts', '.tsx',
    ...(config.resolve.extensions || ['.js', '.json']),
  ];
  return config;
};
```

```sh
npm install --save-dev ts-loader@^8
```

`ts-loader@8` is the last line that supports the webpack 4 skpm ships. Do not upgrade to `ts-loader@9` — it requires webpack 5.

If you additionally import `webpack-merge`, use `merge()` and not `smart()` — the `smart` helper was removed and a transitive dep still references it under certain npm tree shapes.

## Run it

```sh
npm run build          # one-off build
npm run watch          # rebuild on save
npm run start          # watch + reload Sketch on each build
```

The first build installs the plugin into `~/Library/Application Support/com.bohemiancoding.sketch3/Plugins/` as a symlink, so subsequent rebuilds are visible to Sketch right away.

## See the log

```sh
skpm log -f            # tail the plugin log
```

## Publish a release

```sh
skpm login             # paste a GitHub token once (repo scope)
skpm publish patch     # bumps version, tags, creates GitHub release
```

skpm publishes to a GitHub release that Sketch can auto-update from if you set `appcast` in the manifest.

## Templates

```sh
skpm create my-plugin --template with-datasupplier
skpm create my-plugin --template with-webview
```

See [`skpm/skpm`](https://github.com/skpm/skpm) for the full template list.

## Polyfilled core modules

`@skpm/builder` bundles small polyfills for `buffer`, `path`, `crypto`, `stream`, `util`, `events`, `url`, and `assert` — enough to let Node-oriented deps run inside a Sketch plugin. Opt in to the types:

```ts
// src/env.d.ts
/// <reference types="sketch-plugin-types" />
import 'sketch-plugin-types/globals';
import 'sketch-plugin-types/skpm';
```

Then `import * as path from 'path'`, `const { Buffer } = require('buffer')`, etc. resolve with types. Do not install `@types/node` — skpm's polyfill surface is deliberately narrower than Node's, and `@types/node` will over-promise methods that blow up at runtime.

`fs` is intentionally absent — skpm does not polyfill it. Use `NSFileManager` (see [cocoa.md](./cocoa.md)).

## Not polyfilled — shim yourself

Sketch runs plugins in a bare JavaScriptCore context. A number of things most JS libraries assume on `globalThis` are *not* there and skpm does not provide them. The ones we see people hit most often:

- `structuredClone` — missing. Any library that clones state defensively (e.g. `dagre`, `immer` in certain paths) will throw `ReferenceError: Can't find variable: structuredClone`. Shim with `JSON.parse(JSON.stringify(…))` for JSON-safe graphs, or pull in the [`@ungap/structured-clone`](https://www.npmjs.com/package/@ungap/structured-clone) ponyfill for Date / Map / Set / typed arrays.
- `TextEncoder` / `TextDecoder` — missing. Convert through `NSString` + `NSData`:
  ```ts
  const NSString = NSClassFromString('NSString');
  const data = NSString.stringWithUTF8String_(input).dataUsingEncoding_(4); // NSUTF8StringEncoding
  ```
  Or vendor a small pure-JS implementation (`fast-text-encoding`).
- `fetch` — **injected** by `@skpm/builder` via webpack's `ProvidePlugin` → [`sketch-polyfill-fetch`](https://github.com/skpm/sketch-polyfill-fetch) (wraps `NSURLSession`). The function works out of the box; no types ship here, so write `declare const fetch: (...args: any[]) => Promise<any>;` or narrow locally.
- `Request` / `Response` / `Headers` — **not native**. `sketch-polyfill-fetch` returns plain objects with `ok` / `status` / `headers` / `text()` / `json()` but is *not* a WHATWG implementation — `new Response(...)` / `new Headers(...)` / `new Request(...)` all throw. Anything that expects `instanceof Response` will break.
- `FormData` — injected by the same `ProvidePlugin`. Usable as a constructor.
- `URL` / `URLSearchParams` — `URL` is polyfilled via the `url` module, but the WHATWG globals are not injected on `globalThis`. Import what you need from `'url'`.
- `Promise` — present on modern Sketch, but there is no native microtask queue for long-running commands. If your command exits synchronously the promise resolver never fires. Use `Async.createFiber()` to keep the runtime alive (see [developer.sketch.com](https://developer.sketch.com/reference/api/#async)).
- `queueMicrotask` / `setImmediate` / process ticks — missing. Use `setTimeout(fn, 0)`.
- `crypto.subtle`, `crypto.getRandomValues` — the skpm `crypto` polyfill only covers `createHash` / `randomBytes`. For WebCrypto, bridge to `NSData` / `CCHmac` via Cocoa or vendor a JS implementation.
- `fs` — see above; use `NSFileManager`.

If a dependency crashes immediately with `ReferenceError: Can't find variable: X`, that's almost always one of these. Shim at the top of your entry script before the first `import`.
