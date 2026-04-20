# manifest.json with autocomplete

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

## Emitting manifest.json from a TypeScript source

If you author the manifest in `.ts`, you still need a `manifest.json` on disk for Sketch to read. This package ships a tiny CLI that runs your TS module and writes the JSON:

```sh
npx build-manifest src/manifest.ts --out build/manifest.json
```

- Input: a `.ts` / `.tsx` / `.js` / `.mjs` / `.cjs` module whose default export is a `SketchManifest` value (or a zero-arg function returning one).
- `--out` defaults to `manifest.json` next to the input.
- TypeScript sources require `tsx` or `ts-node` in the plugin project's `devDependencies`; JS sources run directly. Add it to your build step or a `prebuild` script.
