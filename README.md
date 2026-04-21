# sketch-plugin-types

Write Sketch plugins in TypeScript with full autocomplete.

Type definitions for the Sketch plugin API — `sketch`, `sketch/dom`, `sketch/ui`, action handlers, `manifest.json`, and a typed Cocoa bridge. No runtime code, just `.d.ts`.

- Targets modern Sketch (99+), verified on 2026.1.1
- Works with `skpm` and plain `tsc`
- 323 action names, 12 with typed payloads
- First-class `manifest.json` types (+ `build-manifest` CLI)
- Typed Foundation bridge (`NSString`, `NSURL`, `NSData`, `NSImage`, `NSBitmapImageRep`, `NSFileManager`)

---

## Install

```sh
npm install --save-dev typescript sketch-plugin-types
```

`tsconfig.json`:

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

Do not include `"dom"` in `lib` — Sketch runs on JavaScriptCore, not a browser.

Create `src/env.d.ts` to turn on ambient globals (one time):

```ts
/// <reference types="sketch-plugin-types" />
import 'sketch-plugin-types/globals';
```

This gives you `context`, `log`, `coscript`, `SketchPluginContext`, and friends.

A minimal command:

```ts
import sketch from 'sketch';
import * as dom from 'sketch/dom';
import * as UI from 'sketch/ui';

export function onRun(_ctx: SketchPluginContext): void {
  const doc = sketch.getSelectedDocument();
  if (!doc) return;

  new dom.Text({
    parent: doc.selectedPage,
    text: 'Hello from TypeScript',
    frame: new dom.Rectangle(0, 0, 320, 40),
  });

  UI.message('Done', doc);
}
```

---

## Guides

| Topic | Doc |
|---|---|
| Building with skpm + polyfilled core modules | [docs/skpm.md](./docs/skpm.md) |
| `manifest.json` with autocomplete + `build-manifest` CLI | [docs/manifest.md](./docs/manifest.md) |
| Typed Action handlers + augmenting payloads | [docs/actions.md](./docs/actions.md) |
| Cocoa / Objective-C APIs | [docs/cocoa.md](./docs/cocoa.md) |

Building without skpm: see [`examples/hello-world/`](./examples/hello-world/) — plain `tsc` + a ~20-line `scripts/bundle.js` shim.

## Modules

| Import | What it gives you |
|---|---|
| `import sketch from 'sketch'` | Facade with `.UI`, `.Settings`, `.Async`, `.DataSupplier`, `.export()` |
| `import * as dom from 'sketch/dom'` | `Document`, `Page`, `Group`, `Artboard`, `Shape`, `ShapePath`, `Image`, `Text`, `Symbol*`, `Style`, `Selection`, `find()`, `fromNative()`, … |
| `import * as UI from 'sketch/ui'` | `message()`, `alert()`, `getInputFromUser()`, `getTheme()` |
| `import * as Settings from 'sketch/settings'` | Per-plugin / document / layer / session key-value storage |
| `import * as Async from 'sketch/async'` | `createFiber()` to keep the plugin alive across async work |
| `import * as DataSupplier from 'sketch/data-supplier'` | Register data suppliers for the Data menu |

## Examples

Eight standalone plugins in [`examples/`](./examples/), each with its own `package.json` and build script:

| Example | Demonstrates |
|---|---|
| [`hello-world`](./examples/hello-world/) | `Group.Frame`, `Text`, `ShapePath`, `UI.message` |
| [`rectangle`](./examples/rectangle/) | `ShapePath` with a solid fill |
| [`grid`](./examples/grid/) | Loops, color math, many layers in one parent |
| [`shape-picker`](./examples/shape-picker/) | `UI.getInputFromUser` with `type: 'selection'` |
| [`rename`](./examples/rename/) | `Selection` iteration, `UI.getInputFromUser` with `type: 'string'` |
| [`watch-selection`](./examples/watch-selection/) | Action API handler on `SelectionChanged` |
| [`cocoa-file-io`](./examples/cocoa-file-io/) | `NSFileManager`, `NSString`, `NSURL`, overloaded `NSClassFromString`, `MOPointer` |
| [`clipboard-roundtrip`](./examples/clipboard-roundtrip/) | `NSPasteboard` read / write, `changeCount`, `availableTypeFromArray_` |

---

## Gotchas

**`context.document` is a native `MSDocument`**, not the `sketch/dom` `Document`. Call `sketch.getSelectedDocument()` or `sketch.fromNative<dom.Document>(ctx.document)` to get the wrapped API.

**`Group.Frame` and `Group.Graphic` require `new`.** `dom.Group.Frame({...})` throws at runtime; the types now forbid it too.

**`ImageData` has no public constructor** — use `ImageData.from(...)`.

**`Style.LineJoin.Miter === 'Mitter'`** — typo lives in Sketch's source, preserved intentionally.

**`sketch` and `sketch/*` are runtime externals.** Your bundler leaves `require('sketch')` alone; Sketch resolves it.

## Troubleshooting

**"Cannot find module 'sketch'"** — add `/// <reference types="sketch-plugin-types" />` to `src/env.d.ts`.

**"Cannot find name 'SketchPluginContext' / 'context' / 'log'"** — `import 'sketch-plugin-types/globals'` in `src/env.d.ts`.

**"Cannot find variable: exports" at runtime** — your bundle has no CommonJS shim. Use skpm, or copy [`examples/hello-world/scripts/bundle.js`](./examples/hello-world/scripts/bundle.js).

**Plugin appears in the menu but nothing happens** — `tail -f ~/Library/Logs/com.bohemiancoding.sketch3/Plugin\ Log.log`.

---

## License

MIT.
