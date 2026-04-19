# Changelog

All notable changes to this package are documented here. Format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
