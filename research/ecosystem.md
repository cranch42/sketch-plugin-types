# Sketch Plugin Typings — Ecosystem Research

Research date: 2026-04-18. Sources are linked inline and summarized at the bottom.

---

## 1. Existing typings on npm and DefinitelyTyped

### 1.1 `@types/sketch` (DefinitelyTyped)

**Does not exist.** `https://registry.npmjs.org/@types/sketch` returns 404. There is no `sketch`, `sketchapp`, `skpm`, or similar folder under `DefinitelyTyped/DefinitelyTyped/types`. The only tangentially related DT package is `@types/react-sketchapp`, which is for the long-deprecated `react-sketchapp` renderer — not the plugin API. This means we are free to publish as a scoped or bare package without a DT conflict.

### 1.2 `sketch-types` (the de facto incumbent)

- **Registry:** https://www.npmjs.com/package/sketch-types
- **Repo:** https://github.com/sketch-community/sketch-types
- **Latest version:** 1.4.5
- **First published:** 2020-12-20
- **Last published:** 2023-01-12 (over 3 years stale as of 2026-04)
- **Author:** Arvin Xu (arvinx@foxmail.com), org `sketch-community`, co-maintainer `yesmeck`
- **License:** MIT
- **Entry:** `main: ./index.js`, `types: ./types/index.d.ts`
- **Dependencies (runtime, pulled in transitively!):**
  - `@sketch-hq/sketch-file-format-ts ^6` — file format types
  - `cocoascript-types` (latest) — Apple Foundation/AppKit types
  - `sketch-internal-types` (latest) — `MSDocument`, etc.
- **File structure** (`types/` folder):
  ```
  types/
    index.d.ts            (triple-slash references only, no declare module)
    async.d.ts
    context.d.ts
    dataSupplier.d.ts
    settings.d.ts
    sketch.d.ts           (declare module 'sketch')
    sketchFormat.d.ts
    ui.d.ts
    utils.d.ts
    dom/
      index.d.ts
      artboard.d.ts, baseLayer.d.ts, colorAsset.d.ts, curvePoint.d.ts,
      document.d.ts, export.d.ts, flow.d.ts, fromNative.d.ts,
      group.d.ts, hotSpot.d.ts, image.d.ts, importableObject.d.ts,
      library.d.ts, override.d.ts, page.d.ts, point.d.ts,
      proporty.d.ts  (sic, typo), rectangle.d.ts, selection.d.ts,
      shape.d.ts, shapePath.d.ts, sharedStyle.d.ts, slice.d.ts,
      style.d.ts, swatch.d.ts, symbolInstance.d.ts, symbolMaster.d.ts,
      text.d.ts, types.d.ts
  ```
- **Module declaration style:** uses `declare module 'sketch'`, `declare module 'sketch/dom'`, etc. The sketch.d.ts uses the legacy `import foo = require('sketch/dom')` + `export import` re-export pattern with `class sketch` + `namespace sketch` merging, then `export = sketch`.
- **Coverage:** DOM (all major classes), UI, Settings, Async, DataSupplier, context, file format. Pulls in full CocoaScript types via dependency.
- **Missing / weak spots:** no updates for Sketch 99+ features (variables, swatches got added in 96, new prototyping, new flex/stack layout variants, dynamic data API changes). Stale enums. No Sketch Library/Cloud Doc Metadata additions. Dependency chain brings in ~100k+ lines of Apple docs-generated types which makes editor completion slow. Install size ~43 files / 95 KB + transitively cocoascript-types (much larger).
- **Setup requires** tsconfig `types: ["sketch-types"]` and listening devs have reported ambient pollution.

### 1.3 `sketch-typings` (predecessor, abandoned)

- **Registry:** https://www.npmjs.com/package/sketch-typings
- **Repo:** https://github.com/arvinxx/sketch-typings
- **Latest version:** 0.4.1
- **Last published:** 2022-05-18 (4 years stale)
- **Author:** Arvin Xu (same author as `sketch-types`)
- **Status:** superseded by `sketch-types`; only 14 files, ~95 KB. Do not recommend; kept alive for old projects.

### 1.4 `@andrewstart/sketch.d.ts`

- **Registry:** https://www.npmjs.com/package/@andrewstart/sketch.d.ts
- **Repo:** https://github.com/andrewstart/sketch.d.ts
- **Latest version:** 0.0.5
- **First published:** 2018-11-03
- **Last published:** 2022-04-04 (stale)
- **Status:** never moved past 0.0.5, narrow scope, effectively abandoned.

### 1.5 `sketch.d.ts` (qjebbs, git-only)

- **Repo:** https://github.com/qjebbs/sketch.d.ts
- **Not on npm.** Install via `git+https://...`.
- **Structure:** two files (`index.d.ts`, `sketch.d.ts`) using `declare module 'sketch'`, `'sketch/dom'`, `'sketch/async'`, `'sketch/data-supplier'`, `'sketch/ui'`, `'sketch/settings'`. Uses an unexposed `_Sketch` namespace as a seam for user augmentation.
- **Status:** 13 stars, 19 commits, effectively frozen. Useful reference for how to structure module-based declarations cleanly without ambient pollution.

### 1.6 Adjacent, different-scope packages (do not overlap with us)

- `@sketch-hq/sketch-file-format-ts` — **official**, published by Sketch; types for the `.sketch` file JSON. Use as a dependency for file-format concerns only.
- `@sketch-hq/sketch-file-format` — the JSON schemas themselves.
- `canvas-sketch-types` — for the `canvas-sketch` creative-coding library, unrelated.
- `@chpio/sketch`, `@cospie/sketch` — unrelated "sketch" JS libs (drawing).
- `cocoascript-types` — Apple framework types (Foundation/AppKit). Generated from Apple docs. Can be declared as a peer/optional dep for us.
- `sketch-internal-types` — undocumented `MSDocument`, etc. Tracks Sketch version numbers (97.0.0). Useful as optional dep.

### 1.7 Official PR that died

Sketch-hq/SketchAPI PR #66 ("Write plugins for Sketch in TypeScript" by pravdomil) proposed converting the whole API to TypeScript. It was never merged. Adds an `index.d.ts`, `src/_globals.d.ts`, and per-class `.ts` files. Confirms there is no official typings story from Sketch HQ for the plugin API.

---

## 2. skpm (Sketch Plugin Manager)

`skpm` is the de facto build/scaffold/publish tool. Website: https://github.com/skpm/skpm.

### 2.1 Typical `package.json`

Straight from `skpm/skpm/template/package.json`:

```json
{
  "name": "{{ slug }}",
  "description": "",
  "version": "0.1.0",
  "engines": { "sketch": ">=49.0" },
  "skpm": {
    "name": "{{ name }}",
    "manifest": "src/manifest.json",
    "main": "{{ slug }}.sketchplugin",
    "assets": ["assets/**/*"],
    "sketch-assets-file": "sketch-assets/icons.sketch"
  },
  "scripts": {
    "build": "skpm-build",
    "watch": "skpm-build --watch",
    "start": "skpm-build --watch --run",
    "postinstall": "npm run build && skpm-link"
  },
  "devDependencies": { "@skpm/builder": "^0.9.5" }
}
```

Key fields:
- `skpm.manifest` — path to manifest source (not the built one).
- `skpm.main` — path to the output `.sketchplugin` bundle folder.
- `skpm.assets` — glob of files copied into `Contents/Resources/`.
- `engines.sketch` — minimum Sketch version.

### 2.2 Builder

- `@skpm/builder` — latest `0.9.5`. Wraps Webpack + Babel. CLI binaries `skpm-build`, `skpm-link`. Handles ES6+ → CocoaScript-compatible JS, bundles per command, exposes custom loaders (`@skpm/file-loader`, `@skpm/nib-loader`), ships `sketch-polyfill-fetch`.
- Custom `webpack.skpm.config.js` is a function `(config, isPluginCommand) => config` (sync or promise).

### 2.3 Bundle layout

A `.sketchplugin` is a macOS package folder:

```
my-plugin.sketchplugin/
  Contents/
    Sketch/
      manifest.json
      my-command.js        (one bundled entry per command)
      shared.js
    Resources/
      icon.png
      ...
```

Each command listed in `manifest.commands[].script` maps to a bundled file under `Contents/Sketch/`. The builder creates one bundle per command (webpack multi-entry) and tree-shakes around each command's handlers.

### 2.4 Templates referenced by the ecosystem

- `skpm/with-webview` (uses `sketch-module-web-view`)
- `skpm/with-datasupplier`
- `skpm/with-prettier`
- `skpm/with-actions`

### 2.5 `sketch-module-web-view`

Installed module, imported as `import BrowserWindow from 'sketch-module-web-view'`. Mimics Electron `BrowserWindow`. Not part of `sketch` namespace — a separate module. If our typings package wants to cover this, add a separate module declaration; otherwise keep it out of scope.

---

## 3. `manifest.json` schema

Authoritative source: https://developer.sketch.com/plugins/plugin-manifest.

### 3.1 Root fields

| Field | Type | Req | Notes |
|---|---|---|---|
| `name` | string | yes | Human-readable plugin name |
| `identifier` | string | yes | Reverse-domain, globally unique |
| `description` | string | yes | |
| `author` | string | yes | |
| `authorEmail` | string | no | |
| `version` | string | yes | Semver; compared to appcast |
| `homepage` | string | no | |
| `appcast` | string | no | URL to updater JSON feed |
| `compatibleVersion` | string | no | Min Sketch version (semver) |
| `maxCompatibleVersion` | string | no | Reference-only, not enforced |
| `bundleVersion` | integer | no | Default `1` |
| `icon` | string | no | 128x128 PNG path under `Contents/Resources` |
| `scope` | `"document"` \| `"application"` | no | Default `document`; `application` = background |
| `suppliesData` | boolean | no | Marks as data supplier |
| `disableCocoaScriptPreprocessor` | boolean | no | Set `true` when using skpm (ES6) |
| `commands` | Command[] | yes | See below |
| `menu` | Menu | no | See below |

### 3.2 `commands[]`

| Field | Type | Req | Notes |
|---|---|---|---|
| `name` | string | yes | Menu label |
| `identifier` | string | yes | Unique within bundle |
| `script` | string | yes | Relative path in `Contents/Sketch/` |
| `handler` | string | no | Function name; default `onRun` |
| `handlers` | Handlers | no | Replaces `handler` for advanced use |
| `shortcut` | string | no | e.g. `"cmd shift k"`, must include a modifier |
| `icon` | string | no | Per-command icon |

### 3.3 `Handlers`

```ts
{
  run?: string,                   // equivalent to top-level "handler"
  setUp?: string,                 // before command
  tearDown?: string,              // after command
  onDocumentChanged?: string,     // document-change hook
  actions?: { [actionName: string]: string }  // e.g. "OpenDocument.finish": "onOpen"
}
```

### 3.4 `menu`

```ts
{
  title?: string,
  isRoot?: boolean,               // put items directly under Plugins menu
  items: Array<string | "-" | { title: string, items: ... }>
}
```

`items` elements are either a command `identifier`, the separator string `"-"`, or a nested submenu object.

### 3.5 Shortcut syntax

Modifiers: `cmd`, `alt`, `ctrl`, `shift` (at least one required). Special keys: `⌫ ⇥ ↩ ⎋ ← → ↑ ↓ ⌦ ↖ ↘ ⇞ ⇟` or their Unicode names. Space-separated tokens.

### 3.6 Actions vocabulary

Full list at https://developer.sketch.com/reference/action/. Each can have `.begin` / `.finish` suffix. Key groups (full list captured separately, >200 identifiers):

- Document: `OpenDocument`, `CloseDocument`, `DocumentSaved`, `Startup`, `Shutdown`
- Selection/Nav: `SelectionChanged`, `ArtboardChanged`, page/zoom actions
- Layer mutations: `LayersMoved`, `LayersResized`, `RenameLayer`, `HideLayer`, `LockLayer`
- Align/Distribute, Shape insertion, Styling, Text, Transforms, Boolean, Path, Grouping, Masking, Symbols, Data, Export, Constraints, Color, Flow, Library, Curve, UI/View, Edit, File, Assistant, Layer focus, and several menu-grouping meta-actions.

We should export the action-name union as a first-class type. Many actions follow `Sketch.MS*` naming.

---

## 4. Runtime environment

### 4.1 Engine

- JavaScriptCore (same as Safari), full ES6.
- CocoaScript bridges Objective-C / macOS frameworks into JS. Docs: https://developer.sketch.com/plugins/cocoascript and https://developer.sketch.com/plugins/javascript-environment.

### 4.2 Preinstalled Node-compatible polyfills

`child_process`, `console`, `events`, `fetch`, `fs`, `os`, `process`, `querystring`, `stream`, `string_decoder`, `timers`, `util`. (These should resolve to `@types/node` lookalikes when the user sets `"types": ["node"]`, but we should not duplicate node types.)

### 4.3 Default-imported frameworks

Foundation and CoreGraphics are auto-loaded. Others require `framework('AVFoundation')` style import.

### 4.4 Globals available to plugin scripts

Confirmed by docs + PR #66's `_globals.d.ts`:

- `context` — passed to the command function; also globally attached. Properties include `document`, `selection`, `command`, `plugin`, `scriptURL`, `scriptPath`, `api()`, `actionContext` (optional). The command function signature is typically `function onRun(context) { }`.
- `log(...args)` — console-like logging, writes to `~/Library/Logs/com.bohemiancoding.sketch3/Plugin Output.log`.
- `print(...args)` — same-ish.
- `coscript` — CocoaScript runtime. Known methods: `setShouldKeepAround(bool)`, `shouldKeepAround()`, `scheduleWithInterval_jsFunction_`, `isRunning()`. Used to keep fibers alive.
- `MOPointer` — `MOPointer.alloc().initWithValue(x)`, `pointer.value()`. Used for `NSError **` out-params.
- `MOJSObject` — rarer; wraps JS objects for ObjC bridging.
- `NSClassFromString("MSDocument")` — Cocoa reflection.
- `framework("name")` — loads an additional Apple framework.
- `require(id)` — the bundler-level require; see section 5.
- Foundation globals once loaded: `NSString`, `NSMutableString`, `NSArray`, `NSMutableArray`, `NSDictionary`, `NSMutableDictionary`, `NSNumber`, `NSData`, `NSURL`, `NSURLRequest`, `NSURLSession`, `NSDate`, `NSError`, `NSNotificationCenter`, etc.
- AppKit once loaded: `NSColor`, `NSImage`, `NSBezierPath`, `NSView`, `NSWindow`, `NSMenu`, `NSMenuItem`, `NSAlert`, `NSPanel`, `NSBundle`, `NSWorkspace`, etc.
- Sketch-internal (undocumented, widely used): `MSDocument`, `MSLayer`, `MSSymbolMaster`, `MSSymbolInstance`, `MSShapeGroup`, `MSTextLayer`, `MSArtboardGroup`, `MSPage`, `MSImmutableDocumentData`, `MSSharedStyle`, `MSApplicationMetadata`, `MSAssetLibrary`, etc. These are what `fromNative()` wraps.

There is no single official "globals page" — the docs point at CocoaScript and the API Reference. Our package should ship an explicit `sketch-globals.d.ts` ambient file (opt-in) covering at minimum `context`, `log`, `print`, `coscript`, `MOPointer`, `framework`, and re-export `cocoascript-types` for the Apple classes (as a peer dep).

### 4.5 Fibers / async

```js
let fiber = require('sketch/async').createFiber()
fiber.onCleanup(() => { /* ... */ })
// later
fiber.cleanup()
```

The JS context is torn down after synchronous command completion unless a fiber is held.

---

## 5. Module resolution

### 5.1 The bundler's `require`

At **build time**, `@skpm/builder` runs Webpack over each command entry. Normal Node resolution applies: `require('./foo')`, `require('some-npm-package')`, etc. All of it gets bundled into `Contents/Sketch/<command>.js`.

### 5.2 The `sketch`, `sketch/*` modules are magic

- `require('sketch')`, `require('sketch/dom')`, `require('sketch/ui')`, `require('sketch/settings')`, `require('sketch/async')`, `require('sketch/data-supplier')` are **provided by Sketch itself at runtime**, not by npm. The skpm builder marks them as externals so webpack leaves the `require` call intact and Sketch resolves it internally.
- Consequence for typings: declare them as **module augmentations**, not as an npm package entry. Use:

  ```ts
  declare module 'sketch' { ... export = sketch; }
  declare module 'sketch/dom' { ... }
  declare module 'sketch/ui' { ... }
  declare module 'sketch/settings' { ... }
  declare module 'sketch/async' { ... }
  declare module 'sketch/data-supplier' { ... }
  ```

  Pattern matches what `sketch-types` and `qjebbs/sketch.d.ts` already do. Do NOT use a root-level `export =` from our package's main entry with the name `sketch`, because consumers will also want `import Sketch = require('sketch')` to resolve.

### 5.3 Additional magic externals

`@skpm/builder` treats these as externals too (bundled list, historical):
- `sketch`, `sketch/*` (above)
- `buffer`, `console`, `events`, `fs`, `os`, `path` (partial), `process`, `querystring`, `stream`, `string_decoder`, `timers`, `util` — Node polyfills.
- `fetch` — provided by `sketch-polyfill-fetch` but injected globally.

We should not redeclare Node polyfills; let users use `@types/node` if they want them.

### 5.4 Other ecosystem modules that live alongside

These are npm modules that plugins commonly `require`. Out of scope for our core typings, but good to mention:
- `sketch-module-web-view` (has its own types)
- `@skpm/builder`, `@skpm/file-loader`, `@skpm/nib-loader`
- `sketch-polyfill-fetch`, `sketch-polyfill-clipboard`

---

## 6. Recommendations for our package shape

1. **Scope/name.** `@types/sketch` is unreserved on DT — could submit there, but the DT review cycle is slow and the surface is large (over-200 action identifiers, many undocumented internals). Prefer a scoped or bare npm name. Candidates: `@sketchplugin/types`, `sketch-plugin-types`, or supersede `sketch-types` by coordinating with `sketch-community` org (author Arvin Xu is reachable). Simplest: pick a fresh scoped name like `@yourorg/sketch-types` and deliberately market as "modern replacement for stale `sketch-types`".

2. **Multi-file, module-declaration approach.** Ship a directory of `.d.ts` files with `declare module 'sketch'` / `'sketch/dom'` / etc. — no ambient globals by default. Offer an opt-in `sketch-typings/globals` side-effect file that declares `context`, `log`, `print`, `coscript`, `MOPointer`, `framework`. Layout:

   ```
   types/
     index.d.ts              // triple-slash refs + re-exports
     sketch.d.ts             // declare module 'sketch'
     dom/
       index.d.ts            // declare module 'sketch/dom'
       ...per-class files
     ui.d.ts
     settings.d.ts
     async.d.ts
     data-supplier.d.ts
     manifest.d.ts           // Manifest, Command, Handlers, Menu, Action names
     globals.d.ts            // side-effect ambient globals (opt-in)
     actions.d.ts            // union of 200+ Action identifier strings
   ```

   Single package.json with `"types": "./types/index.d.ts"` plus conditional exports:
   ```json
   "exports": {
     ".":          { "types": "./types/index.d.ts" },
     "./globals":  { "types": "./types/globals.d.ts" },
     "./manifest": { "types": "./types/manifest.d.ts" }
   }
   ```

3. **Do not bundle `cocoascript-types`.** Make it a `peerDependency` + `peerDependenciesMeta.optional = true`. Same for `sketch-internal-types` and `@sketch-hq/sketch-file-format-ts`. This fixes the biggest complaint about `sketch-types` (heavy editor slowdown from transitive Apple-docs types).

4. **First-class manifest types.** `sketch-types` barely covers the manifest. We can differentiate by exporting:
   - `Manifest`, `ManifestCommand`, `ManifestHandlers`, `ManifestMenu`, `Shortcut`
   - `ActionName` union (derived from our enumerated list)
   - Helper: `defineManifest<T extends Manifest>(m: T): T`

5. **Target modern Sketch.** Pin to Sketch 99+ (currently shipping). Note `compatibleVersion` and drop the pre-53 Actions API shape. `sketch-types` stopped around Sketch 93.

6. **tsconfig guidance.** In README, tell users:
   ```json
   {
     "compilerOptions": {
       "target": "es2020",
       "module": "commonjs",
       "lib": ["es2020"],        // no DOM — JavaScriptCore has no DOM
       "types": []                // do not auto-include @types/*
     }
   }
   ```
   And optionally: `import 'sketch-typings/globals'` in a single ambient file per project.

### Constraints to keep in mind

- JavaScriptCore has no DOM globals; we must not accidentally depend on `lib.dom.d.ts`.
- `fetch` exists but the `sketch-polyfill-fetch` shape is a subset of WHATWG — type it narrowly if at all.
- `context.document` in some Sketch versions is the `MSDocument` native; in others it's already wrapped. Be explicit.
- Action names contain dots (`OpenDocument.finish`), so the union must use string templates: `` `${ActionBase}` | `${ActionBase}.${"begin"|"finish"}` ``.
- Shortcut modifiers must include at least one modifier; encode as a branded string or leave as `string` with JSDoc.
- Plugin scripts run one per command, not as a shared long-lived module. Globals set in one command do not persist.

---

## Sources

- npm: `sketch-types`, `sketch-typings`, `@andrewstart/sketch.d.ts`, `@sketch-hq/sketch-file-format-ts`, `cocoascript-types`, `sketch-internal-types`, `@skpm/builder` (registry JSON endpoints at `registry.npmjs.org/<name>`)
- GitHub: `sketch-community/sketch-types`, `arvinxx/sketch-typings`, `qjebbs/sketch.d.ts`, `skpm/skpm`, `skpm/sketch-module-web-view`, `sketch-hq/SketchAPI` PR #66
- Sketch developer docs: `/plugins/`, `/plugins/plugin-manifest`, `/plugins/plugin-bundle`, `/plugins/javascript-environment`, `/plugins/cocoascript`, `/plugins/actions`, `/reference/api/`, `/reference/action/`
- DefinitelyTyped `types/` listing — confirmed no `sketch*` package
