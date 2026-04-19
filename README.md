# sketch-plugin-types

Write Sketch plugins in TypeScript with full autocomplete.

These are type definitions for the Sketch plugin API. Install the package, point your editor at it, and you get autocomplete and type checks for `sketch`, `sketch/dom`, `sketch/ui`, action handlers, and `manifest.json`.

- No runtime code (just `.d.ts` files)
- Targets modern Sketch (99+)
- Works with `skpm` and plain `tsc`
- 323 action names, 12 of them with typed payloads
- First-class `manifest.json` types

---

## Quick start

### 1. Install

```sh
npm install --save-dev typescript sketch-plugin-types
```

### 2. Set up tsconfig

```json
{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "lib": ["es2020"],
    "strict": true,
    "esModuleInterop": true,
    "types": []
  }
}
```

Note: do not include `"dom"` in `lib`. Sketch runs on JavaScriptCore, not a browser.

### 3. Turn on ambient globals (one time)

Create `src/env.d.ts`:

```ts
/// <reference types="sketch-plugin-types" />
import 'sketch-plugin-types/globals';
```

This gives you `context`, `log`, `coscript`, `SketchPluginContext`, and friends.

### 4. Write your plugin

```ts
// src/my-command.ts
import sketch from 'sketch';
import * as dom from 'sketch/dom';
import * as UI from 'sketch/ui';

export function onRun(_ctx: SketchPluginContext): void {
  const doc = sketch.getSelectedDocument();
  if (!doc) {
    UI.alert('My Plugin', 'Open a document first.');
    return;
  }

  const frame = new dom.Group.Frame({
    parent: doc.selectedPage,
    name: 'Hello',
    frame: new dom.Rectangle(0, 0, 320, 120),
  });

  new dom.Text({
    parent: frame,
    text: 'Hello from TypeScript',
    frame: new dom.Rectangle(0, 40, 320, 40),
    style: { alignment: 'center', fontSize: 20 },
  });

  UI.message('Done', doc);
}
```

That is a complete plugin command. Types help the whole way through.

---

## Building a plugin

You have two options.

### Option A: Use skpm (recommended)

[`skpm`](https://github.com/skpm/skpm) is the standard Sketch plugin toolchain. It scaffolds a project, bundles your code (webpack + babel), installs the plugin into Sketch, watches files on save, and publishes releases.

**Install skpm once, globally:**

```sh
npm install -g skpm
```

**Create a new plugin:**

```sh
skpm create my-plugin
cd my-plugin
npm install
```

You get a plugin folder with this shape:

```
my-plugin/
  src/
    manifest.json        source manifest
    my-command.js        one file per command
  assets/                icons and other resources
  package.json           has an "skpm" field pointing at src/manifest.json
```

**Add TypeScript:**

```sh
npm install --save-dev typescript sketch-plugin-types
```

Rename your source files from `.js` to `.ts`, drop an `env.d.ts` into `src/`:

```ts
// src/env.d.ts
/// <reference types="sketch-plugin-types" />
import 'sketch-plugin-types/globals';
```

Then update `src/manifest.json` so `script` still points at the `.js` output (skpm writes `.js` files regardless of source extension):

```json
{
  "commands": [
    { "script": "my-command.js", "handler": "onRun", "...": "..." }
  ]
}
```

No extra skpm config is needed. `@skpm/builder` ships a TypeScript loader out of the box.

**Run it:**

```sh
npm run build          # one-off build
npm run watch          # rebuild on save
npm run start          # watch + reload Sketch on each build
```

The first build installs the plugin into `~/Library/Application Support/com.bohemiancoding.sketch3/Plugins/` as a symlink, so subsequent rebuilds are visible to Sketch right away.

**See the log:**

```sh
skpm log -f            # tail the plugin log (stdout of log() / print())
```

**Publish a release:**

```sh
skpm login             # paste a GitHub token once (repo scope)
skpm publish patch     # bumps version, tags, creates GitHub release
```

skpm publishes to a GitHub release that Sketch can auto-update from if you set `appcast` in the manifest.

**Templates:**

```sh
skpm create my-plugin --template with-datasupplier
skpm create my-plugin --template with-webview
```

See [`skpm/skpm`](https://github.com/skpm/skpm) for the full template list.

### Option B: Plain tsc

If you want no build tool, compile with `tsc` and wrap the output yourself. A working example lives in [`examples/hello-world/`](./examples/hello-world/), including a ~20-line `scripts/bundle.js` that:

1. Runs `tsc` to emit CommonJS.
2. Prepends an `exports` / `module` shim (Sketch does not provide one).
3. Hoists every exported function onto the script global so Sketch can find `onRun`.
4. Copies your `manifest.json` next to the compiled JS.

Then drop the `.sketchplugin` folder into:

```
~/Library/Application Support/com.bohemiancoding.sketch3/Plugins/
```

Sketch picks it up right away.

---

## manifest.json with autocomplete

```ts
// src/manifest.ts
import { defineManifest } from 'sketch-plugin-types/manifest';

export default defineManifest({
  name: 'My Plugin',
  identifier: 'com.example.my-plugin',
  version: '1.0.0',
  description: 'Does a thing',
  author: 'you',
  disableCocoaScriptPreprocessor: true,
  commands: [
    {
      name: 'Run',
      identifier: 'com.example.my-plugin.run',
      script: 'my-command.js',
      handler: 'onRun',
      shortcut: 'cmd shift k',
    },
  ],
  menu: {
    title: 'My Plugin',
    items: ['com.example.my-plugin.run'],
  },
});
```

`defineManifest` just returns its argument. It exists so your editor narrows the type and shows mistakes.

If you prefer a raw JSON file, type it manually:

```ts
import type { SketchManifest } from 'sketch-plugin-types';
const manifest: SketchManifest = require('./manifest.json');
```

### Emitting `manifest.json` from a TypeScript source

If you author the manifest in `.ts`, you still need a `manifest.json` on disk for Sketch to read. This package ships a tiny CLI that runs your TS module and writes the JSON:

```sh
npx build-manifest src/manifest.ts --out build/manifest.json
```

- Input: a `.ts` / `.tsx` / `.js` / `.mjs` / `.cjs` module whose default export is a `SketchManifest` value (or a zero-arg function returning one).
- `--out` defaults to `manifest.json` next to the input.
- TypeScript sources require `tsx` or `ts-node` in the plugin project's `devDependencies`; JS sources run directly. Add it to your build step or a `prebuild` script.

---

## Listening to Sketch events (actions)

Sketch fires events when the user selects layers, resizes things, saves, etc. You subscribe by mapping the event name to a handler function in your manifest:

```ts
// manifest
handlers: {
  actions: {
    'SelectionChanged.finish': 'onSelectionChanged',
    OpenDocument: 'onDocumentOpened',
  },
}
```

Then export those functions with typed context:

```ts
import type { SketchActionHandler } from 'sketch-plugin-types';

export const onSelectionChanged: SketchActionHandler<'SelectionChanged'> = (ctx) => {
  const { oldSelection, newSelection } = ctx.actionContext;
  log(`${oldSelection.length} -> ${newSelection.length}`);
};
```

The generic parameter narrows `ctx.actionContext` to the exact payload for that event. Hover it in your editor to see what is available.

### Which events have typed payloads?

These twelve are documented and fully typed:

`OpenDocument`, `CloseDocument`, `Startup`, `Shutdown`, `SelectionChanged`, `LayersMoved`, `LayersResized`, `TextChanged`, `ArtboardChanged`, `DocumentSaved`, `HandleURL`, `ExportSlices`

The other 311 action names are valid (autocomplete in the manifest), but their `actionContext` is `unknown` because Sketch does not publish the shape.

### Adding your own payload types

If you have reverse-engineered an action's payload, you can plug it into the map with declaration merging and get the same narrowing as the built-in twelve:

```ts
// src/sketch-actions.d.ts
import 'sketch-plugin-types';

declare module 'sketch-plugin-types' {
  interface SketchActionContextMap {
    LayersGrouped: {
      document: import('sketch/dom').Document;
      group: import('sketch/dom').Group;
      layers: import('sketch/dom').Layer[];
    };
  }
}
```

After that, `SketchActionHandler<'LayersGrouped'>` narrows `ctx.actionContext` to your interface. PRs welcome — if you have confirmed a payload in a current Sketch build, it can graduate into the package itself.

---

## What is in each module

| Import | What it gives you |
|---|---|
| `import sketch from 'sketch'` | The whole API plus `.UI`, `.Settings`, `.Async`, `.DataSupplier` sub-modules and `.export()` |
| `import * as dom from 'sketch/dom'` | `Document`, `Page`, `Group`, `Artboard`, `Shape`, `ShapePath`, `Image`, `Text`, `SymbolMaster`, `SymbolInstance`, `HotSpot`, `Slice`, `Style`, `Fill`, `Border`, `Shadow`, `Gradient`, `SharedStyle`, `Swatch`, `Library`, `Selection`, `Rectangle`, `Point`, `StackLayout`, `Flow`, `ExportFormat`, plus `find()` and `fromNative()` |
| `import * as UI from 'sketch/ui'` | `message()`, `alert()`, `getInputFromUser()`, `getTheme()` |
| `import * as Settings from 'sketch/settings'` | Per-plugin, per-document, per-layer, session key-value storage |
| `import * as Async from 'sketch/async'` | `createFiber()` to keep the plugin alive across async work |
| `import * as DataSupplier from 'sketch/data-supplier'` | Register data suppliers for the Data menu |

### Common patterns

**Read and change the selection:**

```ts
const doc = sketch.getSelectedDocument();
doc?.selectedLayers.forEach((layer) => {
  layer.name = `[x] ${layer.name}`;
});
```

**Find layers by selector:**

```ts
const buttons = dom.find('Group[name*=Button]', doc);
```

**Ask the user for input:**

```ts
UI.getInputFromUser('Pick a number', {
  type: 'slider',
  minValue: 0,
  maxValue: 100,
}, (err, value) => {
  if (err) return;
  UI.message(`You picked ${value}`);
});
```

**Persist a setting:**

```ts
Settings.setSettingForKey('lastRun', Date.now());
const last = Settings.settingForKey<number>('lastRun');
```

**Export a layer to PNG:**

```ts
const pngBytes = sketch.export(layer, {
  formats: 'png',
  output: false,
  scales: '2',
});
```

---

## Gotchas

### `context.document` is not the wrapped Document

When Sketch calls your handler, `context.document` is a native `MSDocument`, not the `sketch/dom` `Document`. If you want the wrapped API, call:

```ts
const doc = sketch.getSelectedDocument();
// or
const doc = sketch.fromNative<dom.Document>(ctx.document);
```

The types enforce this: `SketchPluginContext.document` is typed as `MSDocument`.

### `Group.Frame` and `Group.Graphic` are constructors

Use `new`:

```ts
const frame = new dom.Group.Frame({ /* ... */ });    // correct
const frame = dom.Group.Frame({ /* ... */ });         // throws at runtime
```

### `Style.LineJoin.Miter` equals `'Mitter'`

Typo lives in the Sketch source. The typings preserve it:

```ts
dom.Style.LineJoin.Miter === 'Mitter';   // true
```

### No browser DOM

JavaScriptCore in Sketch has no `window`, `document`, `fetch` (unless you ship `sketch-polyfill-fetch`), etc. Do not add `"dom"` to tsconfig `lib`.

### `sketch` and `sketch/*` are runtime externals

These modules are provided by Sketch itself at runtime. Your bundler (skpm or otherwise) leaves `require('sketch')` as is, and Sketch resolves it. This package only ships type declarations, no runtime code.

---

## Calling Cocoa / Objective-C APIs

Plugins routinely drop into Cocoa for file I/O, image encoding, or URL handling. The package ships typed instance and class interfaces for a small, high-traffic subset of Foundation: `NSString`, `NSURL`, `NSData`, `NSImage`, `NSBitmapImageRep`, `NSFileManager`. Selector names are mapped to JS by replacing each `:` with `_`, matching how CocoaScript bridges them.

`NSClassFromString` is overloaded for these classes, so the returned class object is typed — no `as` cast needed:

```ts
const NSImage = NSClassFromString('NSImage');            // SketchNative.NSImageClass
const NSData = NSClassFromString('NSData');              // SketchNative.NSDataClass
const NSFileManager = NSClassFromString('NSFileManager'); // SketchNative.NSFileManagerClass

const img = NSImage.alloc().initWithContentsOfFile_('/tmp/pic.png');
if (img) log(img.size().width, img.size().height);
```

For anything else, `NSClassFromString` falls back to `unknown`; cast it yourself. If you want exhaustive Apple types, install [`cocoascript-types`](https://www.npmjs.com/package/cocoascript-types) as a peer dev dep and declaration merging will supersede the opaque placeholders this package ships.

---

## Using skpm's polyfilled core modules

`@skpm/builder` bundles small polyfills for `buffer`, `path`, `crypto`, `stream`, `util`, `events`, `url`, and `assert` — enough to let third-party deps that were written for Node run inside a Sketch plugin. Opt in to the types once, globally:

```ts
// src/env.d.ts
/// <reference types="sketch-plugin-types" />
import 'sketch-plugin-types/globals';
import 'sketch-plugin-types/skpm';
```

Then `import * as path from 'path'`, `const { Buffer } = require('buffer')`, etc. resolve with types. Do not install `@types/node` for this — skpm's polyfill surface is deliberately narrower than Node's, and `@types/node` will over-promise methods that blow up at runtime.

`fs` is intentionally absent — skpm does not polyfill it. Use `NSFileManager` via the Cocoa section above.

---

## Examples

The [`examples/`](./examples/) directory contains seven standalone Sketch plugins, each in its own folder with a `package.json`, `tsconfig.json`, and a build script. Every example can be built and installed independently:

```sh
cd examples/hello-world
npm install
npm run build
npm run install-plugin   # copies the .sketchplugin into Sketch's plugin folder
```

| Example | What it does | What it demonstrates |
|---|---|---|
| [`hello-world`](./examples/hello-world/) | Inserts a frame with centered "Hello, World!" text | `Group.Frame`, `Text`, `ShapePath`, `UI.message` |
| [`rectangle`](./examples/rectangle/) | Creates a blue rectangle on the current page | `ShapePath` with a solid fill |
| [`grid`](./examples/grid/) | Builds a 4x3 grid of colored cells inside a Frame | Loops, color math, many layers in one parent |
| [`shape-picker`](./examples/shape-picker/) | Asks which shape to insert via a dropdown | `UI.getInputFromUser` with `type: 'selection'` |
| [`rename`](./examples/rename/) | Batch-renames the selection with a template | `Selection` iteration, `UI.getInputFromUser` with `type: 'string'` |
| [`watch-selection`](./examples/watch-selection/) | Shows a toast on every selection change | Action API handler, `SketchActionHandler<'SelectionChanged'>` |
| [`cocoa-file-io`](./examples/cocoa-file-io/) | Exports the selected layer as PNG under `~/Desktop` | `NSFileManager`, `NSString`, `NSURL`, overloaded `NSClassFromString`, `MOPointer` for error out-params |

Each example uses plain `tsc` + a small [`scripts/bundle.js`](./examples/hello-world/scripts/bundle.js) shim (no skpm required). See [Building a plugin > Option B](#option-b-plain-tsc) for details on why the shim is needed.

---

## Sketch CLI tools

Sketch ships `sketchtool` inside its bundle, useful for running plugins without the GUI:

```sh
export PATH="$PATH:/Applications/Sketch.app/Contents/Resources/sketchtool/bin"
sketchtool run path/to/MyPlugin.sketchplugin my.command.identifier
```

Add the export line to your `~/.zshrc` to keep it.

Note: `skpm` is not bundled with Sketch. Install it separately with `npm install -g skpm` (see the skpm section above).

---

## Troubleshooting

**"Cannot find module 'sketch'"**

Add `/// <reference types="sketch-plugin-types" />` to one of your `.d.ts` files (for example `src/env.d.ts`).

**"Cannot find name 'SketchPluginContext' / 'context' / 'log'"**

Import the opt-in globals:

```ts
import 'sketch-plugin-types/globals';
```

**"Cannot find variable: exports" when your plugin runs**

You compiled with `tsc` but did not wrap the output for Sketch. Either use skpm, or copy the `bundle.js` shim from [`examples/hello-world/scripts/bundle.js`](./examples/hello-world/scripts/bundle.js).

**The plugin appears in the menu but nothing happens**

Check the log:

```sh
tail -f ~/Library/Logs/com.bohemiancoding.sketch3/Plugin\ Log.log
```

Most errors show up there.

---

## License

MIT.
