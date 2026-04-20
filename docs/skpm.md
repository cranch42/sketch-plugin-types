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

No extra skpm config is needed — `@skpm/builder` ships a TypeScript loader out of the box.

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
