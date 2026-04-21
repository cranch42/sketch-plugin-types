# Changelog

All notable changes to this package are documented here. Format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.2] — 2026-04-22

Docs-only release. Acknowledges the current state of the skpm toolchain
and surfaces the plain-`tsc` / `esbuild` alternative for greenfield
plugins. No API changes — `sketch-plugin-types/skpm` subpath stays as
is, since the polyfill surface it types is itself frozen and therefore
correct indefinitely.

### Changed

- **`docs/skpm.md` — added a status note at the top.** `@skpm/builder`
  is in maintenance (`0.9.5`, 2023-10-10, still on webpack 4). The
  runtime bits (`sketch-module-web-view`, `sketch-polyfill-fetch`) are
  still actively patched; the build tooling is not. For new plugins,
  consider building directly onto the `.sketchplugin` bundle layout
  with `tsc` + a bundle script — see `examples/hello-world/`.
- **README — new "Two build paths" subsection.** Explicit choice
  between skpm (maintenance / compat) and plain `tsc`/`esbuild`
  (recommended for new plugins). Both paths consume the same types.

## [0.3.1] — 2026-04-21

Post-release fact-check pass — three inaccuracies shipped in 0.3.0 were
audited against `sketch-hq/SketchAPI` and `skpm/skpm` sources and
corrected here. No API changes.

### Fixed

- **`verticalAlignment` is no longer `@deprecated` on `StyleProps` or
  `Style`.** Only the `Text`-layer path (`new Text({ verticalAlignment })`
  or `textLayer.verticalAlignment =`) is broken — assigning on the
  *Style* works (`text.style.verticalAlignment = 'center'` is the
  supported path, implemented in `Source/dom/style/Text.js`). The
  `@deprecated` tag now lives only on `TextProps.verticalAlignment`
  with jsdoc pointing at the working alternative and
  [sketch-hq/SketchAPI#447](https://github.com/sketch-hq/SketchAPI/issues/447).
- **`SketchManifestCommand.handler` jsdoc cited the wrong runtime
  error.** The previous text said `TypeError: … is not a function`;
  skpm actually throws `Error: Missing export named "<handler>". Your
  command should contain something like \`export function <handler>() {}\`.`
  from `packages/builder/src/utils/webpackHeaderFooterPlugin.js`.
- **`docs/skpm.md` "Not polyfilled" section overstated the `fetch`
  gap.** `@skpm/builder` *does* inject `fetch` via webpack's
  `ProvidePlugin` → `sketch-polyfill-fetch`, so the function works
  out of the box. What's still missing are the WHATWG classes
  `Request` / `Response` / `Headers` — the polyfill returns plain
  objects, not constructor instances. `FormData` is also injected
  (added to the section for completeness).

## [0.3.0] — 2026-04-21

Driven by early-adopter feedback: the clipboard was the single most-hit
gap, plus a round of jsdoc / docs fixes for things the types quietly
lied about or under-documented.

### Added

- **`NSPasteboard` in the typed Cocoa bridge.** `NSPasteboardInstance`
  covers the realistic plugin surface — `clearContents`,
  `declareTypes_owner_` (accepts a JS array, auto-bridged to `NSArray`),
  `setString_forType_` / `setData_forType_`, `stringForType_` /
  `dataForType_`, `types`, `availableTypeFromArray_`, `changeCount`.
  `NSPasteboardClass` exposes `generalPasteboard`, `pasteboardWithName_`,
  `pasteboardWithUniqueName`. New branded alias `NSPasteboardType` for
  UTI strings (`'public.utf8-plain-text'`, `'public.html'`, …).
- **`NSClassFromString('NSPasteboard')` overload** in `globals.d.ts`
  returns `NSPasteboardClass` directly — no cast.
- **`examples/clipboard-roundtrip/`** — new runnable plugin with two
  commands (read the pasteboard into a UI alert; copy selection names
  into the pasteboard). Same bundle pattern as `cocoa-file-io`.
- **`test/cocoa.ts`** — new cases for the pasteboard: read/write/preview,
  `changeCount` polling, named pasteboards.

### Changed

- **`Text.verticalAlignment` is now `@deprecated`.** Sketch ignores the
  property at runtime (`no idea what to do with "verticalAlignment" in
  Text`). The jsdoc points at the working alternative: call
  `text.adjustToFit()` and offset `text.frame.y` manually. Marked in all
  three declaration sites (`StyleProps`, `Style`, `TextProps`).
- **`ShapePath.fromSVGPath` has `@remarks`.** Documented the non-obvious
  normalization: the returned `frame` matches the path's bounding box and
  every `CurvePoint` coordinate is stored as a percentage of that frame
  (`0`–`1`), not in points. Previously one-liner; now includes a worked
  example.
- **`SketchManifestCommand.handler` jsdoc spells out the skpm export
  convention.** `handler: "onRun"` maps to `export default`; any other
  value maps to a named export of the same name. Mismatch only surfaces
  as a runtime `TypeError`, so the hint belongs in the type.
- **`docs/skpm.md` — softened the "TS out of the box" claim.** In
  practice `@skpm/builder@0.9.5` is flaky about `.ts` sources; added a
  minimal working `webpack.skpm.config.js` with `ts-loader@8` (webpack 4)
  and a note on the `webpack-merge.smart` footgun.
- **`docs/skpm.md` — new "Not polyfilled — shim yourself" section.**
  Lists globals and APIs that the bare JavaScriptCore context lacks and
  skpm does not fill in: `structuredClone`, `TextEncoder` /
  `TextDecoder`, `fetch`, WHATWG `URL` globals, `queueMicrotask`,
  `crypto.subtle`, `fs`. Each entry has a shim hint.

### Compatibility

Fully backwards compatible with 0.2.x. `NSPasteboard` is additive and
the `@deprecated` flag is advisory only — existing assignments to
`verticalAlignment` still compile.

## [0.2.3] — 2026-04-20

### Changed

- **README trimmed from 519 to 134 lines.** Long-form guides moved to
  dedicated `docs/*.md` files, each linked from a navigation table in the
  README: `docs/skpm.md` (skpm toolchain + polyfilled core modules),
  `docs/manifest.md` (`defineManifest` + `build-manifest` CLI),
  `docs/actions.md` (typed action handlers + payload augmentation),
  `docs/cocoa.md` (Foundation bridge + overloaded `NSClassFromString`).
  README keeps install, tsconfig, a minimal command, module and examples
  tables, gotchas, and troubleshooting. Dropped "Common patterns"
  (duplicated `examples/`) and "Sketch CLI tools" (not about types).

### Packaging

- `files` now includes `docs/` so the tarball stays self-contained when
  read from `node_modules`. No code or type changes.

## [0.2.2] — 2026-04-19

### Added

Missing `init*` methods on Foundation classes that already shipped
typed `alloc()`. Before 0.2.2 the `alloc()` return type pointed at an
instance with no way to initialize it, so authors either had to call
through class factories (`NSString.stringWithUTF8String_`) or augment
locally — now the canonical `alloc().initWith…()` pairs type-check
directly.

- `NSString`: `initWithUTF8String_`, `initWithString_`,
  `initWithData_encoding_`. New helper alias `NSStringEncoding`.
- `NSData`: `initWithBytes_length_`, `initWithContentsOfURL_`,
  `initWithContentsOfFile_`, `initWithBase64EncodedString_options_`.
  New helper alias `NSDataBase64DecodingOptions`.
- `NSURL`: `initWithString_`, `initFileURLWithPath_`.
- `NSImage`: `initWithSize_`.
- `NSBitmapImageRep`: `initWithData_` and the 10-argument designated
  initializer
  `initWithBitmapDataPlanes_pixelsWide_pixelsHigh_bitsPerSample_samplesPerPixel_hasAlpha_isPlanar_colorSpaceName_bytesPerRow_bitsPerPixel_`.
  New helper alias `NSColorSpaceName`.
- `test/cocoa.ts` now exercises every new `init*` pair.

Fully backwards compatible — additive change, no signatures removed.

## [0.2.1] — 2026-04-19

### Fixed

- `Group.Frame` and `Group.Graphic` are now constructor-only (`new …()`).
  The previous declaration also allowed callable form (`Group.Frame({…})`)
  which throws at runtime in modern Sketch — the types now reject it at
  compile time. README already documented this as a gotcha; the type-level
  enforcement catches up.
- `ImageData` now has a `private constructor()`. `new ImageData()` is no
  longer allowed — use the `ImageData.from(…)` static factory instead, as
  the runtime has always required.

### Added

- `prepublishOnly` script runs `lint` + `test` before every publish so a
  broken `.d.ts` can never ship again.
- GitHub Actions CI (`.github/workflows/ci.yml`) runs the full typecheck on
  Node 18 / 20 / 22 on every push to `main` and every PR.
- Negative tests cover the `Group.Frame` / `Group.Graphic` / `ImageData`
  footguns.

## [0.2.0] — 2026-04-19

### Added

- **Typed Cocoa bridge for a Foundation subset.** `SketchNative` now ships
  `FooInstance` + `FooClass` interface pairs for `NSString`, `NSURL`, `NSData`,
  `NSImage`, `NSBitmapImageRep`, and `NSFileManager`. The historical
  `type Foo = Opaque<'Foo'>` aliases are preserved as `type Foo = FooInstance`
  so existing code keeps compiling.
- **Overloaded `NSClassFromString`.** Calling it with a literal class name
  listed above now returns the corresponding `FooClass` interface directly —
  no `as` cast needed. Other names fall through to the `string → unknown`
  overload as before.
- **`sketch-plugin-types/skpm` subpath.** New ambient declarations for the
  Node-like polyfills that `@skpm/builder` injects: `buffer`, `path`, `crypto`
  (subset), `stream` (stubs), `util`, `events`, `url`, `assert`. Opt in with
  `import 'sketch-plugin-types/skpm';`. `fs` is intentionally excluded — skpm
  does not polyfill it; use `NSFileManager` instead.
- **`build-manifest` CLI.** Ships under `bin`. Runs a TS/JS module whose
  default export is a `SketchManifest` value and writes the JSON:
  ```sh
  npx build-manifest src/manifest.ts --out build/manifest.json
  ```
  TypeScript sources require `tsx` or `ts-node` in the plugin project.
- **Action payload augmentation pattern.** README now documents how to
  extend `SketchActionContextMap` via `declare module 'sketch-plugin-types'`
  so community-reverse-engineered payloads can plug in without a package
  release.
- **`examples/cocoa-file-io/`.** New runnable example that exports the
  selected layer via `sketch.export()` and exercises the typed Cocoa bridge
  (`NSFileManager`, `NSString`, `NSURL`) for path handling.
- **New tests.** `test/skpm.ts` covers every module in the skpm subpath;
  `test/cocoa.ts` covers the overloaded `NSClassFromString` and the new
  Foundation interfaces.

### Changed

- `types/globals.d.ts` — `NSClassFromString` is no longer a single
  `(name: string) => unknown`. The trailing `string` overload preserves the
  escape hatch for any class not yet named.

### Compatibility

- Fully backwards compatible with `0.1.x`. Existing imports and call sites
  continue to type-check; the new surfaces are additive.

## [0.1.1] — 2026-04-01

Initial public release. TypeScript definitions for the Sketch plugin API
(`sketch`, `sketch/dom`, `sketch/ui`, `sketch/settings`, `sketch/async`,
`sketch/data-supplier`), 323 Action API names (12 with typed payloads),
`manifest.json` types, and opt-in CocoaScript ambient globals.
