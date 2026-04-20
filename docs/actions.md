# Listening to Sketch events (actions)

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

## Which events have typed payloads?

These twelve are documented and fully typed:

`OpenDocument`, `CloseDocument`, `Startup`, `Shutdown`, `SelectionChanged`, `LayersMoved`, `LayersResized`, `TextChanged`, `ArtboardChanged`, `DocumentSaved`, `HandleURL`, `ExportSlices`

The other 311 action names are valid (autocomplete in the manifest), but their `actionContext` is `unknown` because Sketch does not publish the shape.

## Adding your own payload types

If you have reverse-engineered an action's payload, plug it into the map with declaration merging and get the same narrowing as the built-in twelve:

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
