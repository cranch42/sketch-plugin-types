# Sketch Plugin JavaScript API - Complete Inventory

Source: https://developer.sketch.com/reference/api/ and upstream source code at
https://github.com/sketch-hq/SketchAPI (`Source/**`). Values marked `verbatim`
are copied from the official source; everything else is derived from the same.

All classes live under one of these require paths:

```js
const sketch       = require('sketch')              // convenience: everything
const dom          = require('sketch/dom')          // DOM classes + find/export/fromNative
const UI           = require('sketch/ui')
const Settings     = require('sketch/settings')
const Async        = require('sketch/async')
const DataSupplier = require('sketch/data-supplier')
```

The `sketch` convenience module re-exports `sketch/dom` and adds
`.Async`, `.DataSupplier`, `.Settings`, `.UI` as properties.

---

## Top-level `sketch` / `sketch/dom` module

`require('sketch/dom')` exports:

| Export | Kind | Notes |
|---|---|---|
| `export` (fn) | function | Aliased to `exportObject`. Exports any number of layers/pages/docs. |
| `fromSketchJSON(json, version?)` | function | Restores a wrapped object from exported Sketch JSON. |
| `createLayerFromData(data, type)` | function | |
| `Document` | class | |
| `getDocuments()` | function | returns `Document[]` |
| `getSelectedDocument()` | function | returns `Document \| undefined` |
| `Library` | class | |
| `getLibraries()` | function | returns `Library[]` |
| `SharedStyle` | class | |
| `SmartLayout` | object (enum) | |
| `StackLayout` | class | |
| `Rectangle` | class | |
| `Style` | class | |
| `Layer` | class | base |
| `FlexSizing` | enum | `Fixed, Fit, Fill, Relative` |
| `Pin` | enum | `None, Min, Max, Both` |
| `Group` | class | |
| `GroupBehavior` | enum | `Default, Frame, Graphic` |
| `Text` | class | |
| `Image` | class | |
| `Shape` | class | |
| `ShapePath` | class | |
| `Artboard` | class | Legacy alias for a Frame Group. |
| `Page` | class | |
| `SymbolMaster` | class | |
| `SymbolInstance` | class | |
| `HotSpot` | class | |
| `Slice` | class | |
| `Swatch` | class | |
| `Types` | object | String-literal union of every `type` value |
| `fromNative(native)` | function | Alias of `wrapObject`; wraps a native MS* object |
| `getGlobalColors()` | function | |
| `getGlobalGradients()` | function | |
| `globalAssets` | object | |
| `Flow` | object | `{ AnimationType, BackTarget }` (not a class on DOM) |
| `find` | function | See below |
| `version` | `{ sketch: string, api: string }` | populated at build time |

### `fromNative(nativeSketchObject) → WrappedObject`

Returns a wrapped Sketch DOM object of the correct subclass.

### `find(selector, scope?, options?) → Layer[]`

Sizzle-style CSS-like selector engine over Sketch layers.

- `selector` - string, may be comma-separated list of predicates.
- `scope` - `Document | Page | Layer | native`. Defaults to `getSelectedDocument()`.
- `options` - `{ inclusive?: boolean }` - whether to include `scope` itself.

Supported selector grammar:

- Type: `Artboard`, `Group`, `Frame`, `Graphic`, `Page`, `Shape`, `ShapePath`, `Image`, `Text`, `SymbolMaster`, `SymbolInstance`, `HotSpot`, `Slice`, `*`.
  (`Artboard` is kept for backwards compatibility - returns canvas-level Frames.)
- ID: `#identifier`
- Attribute: `[attr op value]` with ops `=`, `~=` (LIKE[c]), `*=` (CONTAINS), `~*=` (CONTAINS[c]), `$=` (ENDSWITH), `!=`, `^=` (BEGINSWITH), `>=`, `=<`, `>`, `<`
  Supported attributes: `name`, `id`, `frame`, `frame.x`, `frame.y`, `frame.width`, `frame.height`, `locked`, `hidden`, `selected`, `type`, `style.fills.color`.
- Boolean pseudo-classes: `:locked`, `:not-locked`, `:hidden`, `:not-hidden`, `:selected`, `:not-selected`.

### `export(object, options?) → true | Buffer | Buffer[] | object | object[]`

Export any number of layers, pages or documents.

`object` may be a `Layer | Page | Document` or an **array** of any of those.

`options` (all optional):

| Key | Type | Default | Notes |
|---|---|---|---|
| `formats` | `string` \| `string[]` | `'png'` | comma-separated list. Supported: `'png'`, `'jpg'`, `'svg'`, `'pdf'`, `'eps'`, `'tiff'`, `'webp'`, `'json'` |
| `output` | `string \| false` | `'~/Documents/Sketch Exports'` | folder path; if falsy, returns data instead of writing |
| `overwriting` | `boolean` | `false` | |
| `trimmed` | `boolean` | `false` | trim transparent edges |
| `scales` | `string` | `'1'` | comma-separated scales e.g. `'1,2,3'` |
| `use-id-for-name` | `boolean` | `false` | use layer id as filename |
| `compact` | `boolean` | `false` | SVG only |
| `include-namespaces` | `boolean` | `false` | SVG only |
| `save-for-web` | `boolean` | `false` | PNG only (strips metadata) |
| `compression` | `number 0..1` | `1.0` | JPG only |
| `progressive` | `boolean` | `false` | JPG only |
| `group-contents-only` | `boolean` | `false` | |
| `exportFormats` | `ExportFormat[]` | - | overrides default format selection |

Return value:
- With `output` set (default): returns `true` after writing files.
- With `output` falsy AND exactly one `formats` entry: returns `Buffer` (for images) or parsed `object` (for `json`). If input is an array, returns an array.

### `version`

```ts
{ sketch: string; api: string }
```

---

## Document

Extends `WrappedObject`. Import: `require('sketch/dom').Document`.

### Constructor

```ts
new Document(properties?: { colorSpace?: Document.ColorSpace })
```

Creates a brand-new Sketch document window.

### Static methods

| Signature | Returns |
|---|---|
| `Document.getSelectedDocument()` | `Document \| undefined` |
| `Document.getDocuments()` | `Document[]` |
| `Document.open(path?: string, callback: (err: Error \| null, doc?: Document) => void)` | `void` |
| `Document.open(callback)` | `void` - prompts user for file |
| `Document.fromNative(native)` | `Document` |

### Instance properties

| Name | Type | RO | Description |
|---|---|---|---|
| `id` | `string` | yes | Unique identifier |
| `type` | `'Document'` | yes | |
| `pages` | `Page[]` | | Mutable array |
| `selectedPage` | `Page` | | |
| `selectedLayers` | `Selection` | yes | Proxy for current page selection |
| `path` | `string` | yes | File path or remote library URL |
| `sharedLayerStyles` | `SharedStyle[]` | | Mutable array, `.push({name, style})` supported |
| `sharedTextStyles` | `SharedStyle[]` | | Mutable array |
| `colors` | `ColorAsset[]` | | Mutable array |
| `swatches` | `Swatch[]` | | Mutable array (Color Variables) |
| `gradients` | `GradientAsset[]` | | Mutable array |
| `colorSpace` | `Document.ColorSpace` | | |
| `sketchObject` | `MSDocument` | yes | |

### Instance methods

```ts
save(): void
save(path: string): void
save(path: string, options: { saveMode?: Document.SaveMode; iKnowThatImOverwritingAFolder?: boolean }): void
save(path: string | undefined, options: {...} | undefined, callback: (err: Error | null) => void): void

close(): void

centerOnLayer(layer: Layer): void
zoomToFitCanvas(): void
changeColorSpace(colorSpace: Document.ColorSpace, convert?: boolean): void

getLayerWithID(layerId: string): Layer | undefined
getLayersNamed(name: string): Layer[]

getSharedLayerStyleWithID(sharedStyleId: string): SharedStyle | undefined
getSharedTextStyleWithID(sharedStyleId: string): SharedStyle | undefined

getSymbols(): SymbolMaster[]
getSymbolMasterWithID(symbolId: string): SymbolMaster | undefined
```

### Enums

`Document.SaveMode` (string union):
- `'Save'` - overwrite in place
- `'SaveAs'` - write to new file, updates document's location
- `'SaveTo'` - write to new file, does not update document's location

`Document.ColorSpace` (string union):
- `'sRGB'`
- `'P3'`
- `'Unmanaged'` *(deprecated)*

---

## Library

Import: `require('sketch/dom').Library`. Cannot be constructed directly.

### Properties

| Name | Type | RO |
|---|---|---|
| `id` | `string` | yes |
| `name` | `string` | yes |
| `valid` | `boolean` | yes |
| `enabled` | `boolean` | |
| `libraryType` | `Library.LibraryType` | yes |
| `lastModifiedAt` | `Date` | yes |
| `sketchObject` | `native` | yes |

### Static methods

```ts
Library.getLibraries(): Library[]
Library.getLibraryForDocumentAtPath(path: string): Library
Library.getRemoteLibraryWithRSS(url: string, callback: (err: Error | null, library?: Library) => void): void
```

### Instance methods

```ts
remove(): void
getDocument(): Document                                   // may throw
getImportableReferencesForDocument(doc: Document): ImportableObject[]
getImportableSymbolReferencesForDocument(doc: Document): ImportableObject[]
getImportableLayerStyleReferencesForDocument(doc: Document): ImportableObject[]
getImportableTextStyleReferencesForDocument(doc: Document): ImportableObject[]
getImportableSwatchReferencesForDocument(doc: Document): ImportableObject[]
```

### Enums

`Library.LibraryType` (string union):
- `'Internal'`
- `'LocalUser'` *(formerly `'User'`)*
- `'RemoteUser'` *(formerly `'Remote'`)*
- `'RemoteTeam'`
- `'RemoteThirdParty'`

`Library.ImportableObjectType` (string union):
- `'Symbol'`
- `'LayerStyle'`
- `'TextStyle'`
- `'Swatch'`

---

## ImportableObject

Returned from `Library.getImportable*`.

| Name | Type |
|---|---|
| `id` | `string` |
| `name` | `string` |
| `objectType` | `Library.ImportableObjectType` |
| `library` | `Library` |

```ts
import(): SymbolMaster | SharedStyle | Swatch
```

---

## Layer (abstract base class)

Base for `Group`, `Shape`, `ShapePath`, `Image`, `Text`, `SymbolMaster`, `SymbolInstance`, `HotSpot`, `Slice`, `Page`, `Artboard`.

### Properties (inherited by all)

| Name | Type | RO |
|---|---|---|
| `id` | `string` | yes |
| `type` | string literal of class | yes |
| `name` | `string` | |
| `nameIsFixed` | `boolean` | |
| `parent` | `Group \| Document` | |
| `locked` | `boolean` | |
| `hidden` | `boolean` | |
| `frame` | `Rectangle` | |
| `horizontalSizing` | `FlexSizing` | |
| `verticalSizing` | `FlexSizing` | |
| `horizontalPins` | `Pin` | |
| `verticalPins` | `Pin` | |
| `selected` | `boolean` | |
| `flow` | `Flow \| undefined` | |
| `exportFormats` | `ExportFormat[]` | |
| `transform` | `{ rotation: number; flippedHorizontally: boolean; flippedVertically: boolean }` | |
| `style` | `Style` | (on `StyledLayer` subclasses) |
| `sharedStyle` | `SharedStyle \| null` | (on `StyledLayer` subclasses) |
| `sharedStyleId` | `string \| null` | |
| `index` | `number` | - 0 = back |
| `sketchObject` | native | yes |
| `closestMaskingLayer` | `Layer \| null` | yes |
| `breaksMaskChain` | `boolean` | |
| `ignoresStackLayout` | `boolean` | |
| `preservesSpaceInStackLayoutWhenHidden` | `boolean` | |
| `masksSiblings` | `boolean` | (Shape, ShapePath) |
| `maskMode` | `Layer.MaskMode` | (Shape, ShapePath) |

### Instance methods

```ts
duplicate(): Layer
remove(): Layer
moveToFront(): Layer
moveForward(): Layer
moveToBack(): Layer
moveBackward(): Layer

getParentPage(): Page | undefined
getParentArtboard(): Artboard | undefined       // canvas-level Frame
getParentSymbolMaster(): SymbolMaster | undefined
getParentShape(): Shape | undefined

// Deprecated:
localRectToPageRect(rect: Rectangle): Rectangle
localRectToParentRect(rect: Rectangle): Rectangle

export(options?: ExportOptions, callback?: (err: Error | null) => void): void
```

### Enum

`Layer.MaskMode` (string union):
- `'Outline'`
- `'Alpha'`

---

## Group (extends Layer)

Import: `require('sketch/dom').Group`.

### Constructor

```ts
new Group(properties?: {
  name?: string
  layers?: Layer[]
  frame?: Rectangle
  parent?: Group | Page
  locked?: boolean
  hidden?: boolean
  selected?: boolean
  groupBehavior?: GroupBehavior
  smartLayout?: SmartLayout
  stackLayout?: StackLayout
  flow?: Flow
  exportFormats?: ExportFormat[]
  style?: StyleProps
  background?: { enabled?: boolean; includedInExport?: boolean; includedInInstance?: boolean; color?: string }
})
```

### Static subclass constructors

```ts
Group.Frame(properties?): Group      // groupBehavior = Frame
Group.Graphic(properties?): Group    // groupBehavior = Graphic
```

### Extra properties (beyond Layer)

| Name | Type | RO |
|---|---|---|
| `layers` | `Layer[]` | - Mutable |
| `groupBehavior` | `GroupBehavior` | |
| `isFrame` | `boolean` | yes |
| `isGraphicFrame` | `boolean` | yes |
| `clipsContents` | `boolean` | |
| `smartLayout` | `SmartLayout \| null` | (legacy) |
| `stackLayout` | `StackLayout \| null` | |
| `flowStartPoint` | `boolean` | |
| `background` | `{ enabled; includedInExport; includedInInstance; color }` | |

### Methods

```ts
adjustToFit(): Group
```

### Enum

`GroupBehavior` (integer enum, but accepts string keys):
- `Default`
- `Frame`
- `Graphic`

---

## Artboard (extends Group)

**Legacy.** Kept as a marker for top-level Frames. Not constructed directly -
use `Group.Frame({...})`.

Access pattern: `page.canvasLevelFrames` or `find('Artboard', page)`.

```ts
class Artboard extends Group {
  constructor(properties?: GroupProperties)  // always sets groupBehavior = Frame
  getParentArtboard(): undefined
}
```

---

## Page (extends Group)

Import: `require('sketch/dom').Page`. Extends Group.

### Constructor

```ts
new Page(properties?: {
  name?: string
  layers?: Layer[]
  parent?: Document
  selected?: boolean
})
```

### Extra properties

| Name | Type |
|---|---|
| `parent` | `Document` |
| `selectedLayers` | `Selection` |
| `canvasLevelFrames` | `Artboard[]` |

### Static methods

```ts
Page.getSymbolsPage(document: Document): Page | undefined
Page.createSymbolsPage(): Page
```

### Instance methods

```ts
isSymbolsPage(): boolean
getParentPage(): undefined
// movement methods (moveToFront/Back/…) are no-ops on Page
```

Deleted properties (from Layer) on Page: `flow`, `style`, `locked`, `hidden`, `exportFormats`, `transform`, `smartLayout`.

---

## Shape (extends Layer / StyledLayer)

Legacy container that holds a group of `ShapePath` layers combined via boolean operations.

### Constructor

```ts
new Shape(properties?: {
  name?: string
  parent?: Group
  frame?: Rectangle
  layers?: ShapePath[]
  style?: StyleProps
  // ... all Layer properties
  masksSiblings?: boolean
  maskMode?: Layer.MaskMode
})
```

### Properties

All Layer properties plus `layers`, `style`, `sharedStyle`, `sharedStyleId`, `masksSiblings`, `maskMode`.

---

## ShapePath (extends Layer / StyledLayer)

### Constructor

```ts
new ShapePath(properties?: {
  name?: string
  parent?: Group
  frame?: Rectangle
  shapeType?: ShapePath.ShapeType   // default 'Rectangle' (or 'Custom' if `points` given)
  points?: CurvePoint[]
  closed?: boolean
  style?: StyleProps
  // ... all Layer properties
})
```

### Extra properties

| Name | Type | RO |
|---|---|---|
| `shapeType` | `ShapePath.ShapeType` | yes |
| `points` | `CurvePoint[]` | |
| `closed` | `boolean` | |
| `edited` | `boolean` | |
| `masksSiblings` | `boolean` | |
| `maskMode` | `Layer.MaskMode` | |

### Static methods

```ts
ShapePath.fromSVGPath(svgPath: string): ShapePath
```

### Instance methods

```ts
getSVGPath(): string
```

### Enums

`ShapePath.ShapeType` (string union):
- `'Rectangle'`
- `'Oval'`
- `'Triangle'`
- `'Polygon'`
- `'Star'`
- `'Custom'`

`ShapePath.PointType` (string union) — same as `CurvePoint.PointType`:
- `'Undefined'`
- `'Straight'`
- `'Mirrored'`
- `'Asymmetric'`
- `'Disconnected'`

---

## CurvePoint

Not directly constructable; owned by `ShapePath.points`.

| Property | Type |
|---|---|
| `point` | `Point` |
| `curveFrom` | `Point` |
| `curveTo` | `Point` |
| `cornerRadius` | `number` |
| `pointType` | `CurvePoint.PointType` |

```ts
isSelected(): boolean
```

---

## Image (extends Layer / StyledLayer)

### Constructor

```ts
new Image(properties?: {
  name?: string
  parent?: Group
  frame?: Rectangle
  image?: ImageDataInput
  style?: StyleProps
})
```

`ImageDataInput` can be:
- `string` path
- `{ path: string }`
- `{ base64: string }`
- a native `NSImage` / `NSURL` / `NSData` / `Buffer`
- an `ImageData` wrapper

### Extra properties

| Name | Type |
|---|---|
| `image` | `ImageData` |

### Instance methods

```ts
resizeToOriginalSize(): Image
removeBackground(options?: { people?: boolean }, callback?: (err: Error | undefined) => void): void
```

### Static

```ts
Image.removeBackgroundFromLayers(layers: Image[], options?: { people?: boolean }, callback?: (err: Error | undefined) => void): void
```

---

## ImageData

Not directly constructable from user code — created via `ImageData.from(...)`.

| Property | Type |
|---|---|
| `nsimage` | `NSImage` |
| `nsdata` | `NSData` |
| `size` | `{ width: number; height: number }` |
| `base64` | `string` |

```ts
static ImageData.from(value: string | { path: string } | { base64: string } | NSImage | NSData | Buffer): ImageData
```

---

## Text (extends Layer / StyledLayer)

### Constructor

```ts
new Text(properties?: {
  name?: string
  parent?: Group
  frame?: Rectangle
  text?: string
  alignment?: Text.Alignment            // (also available on style)
  verticalAlignment?: Text.VerticalAlignment
  lineSpacing?: Text.LineSpacing
  fixedWidth?: boolean
  style?: StyleProps
})
```

### Extra properties

| Name | Type |
|---|---|
| `text` | `string` |
| `lineSpacing` | `Text.LineSpacing` |
| `fixedWidth` | `boolean` |
| `fragments` (getter) | `Array<{ rect: Rectangle; baselineOffset: number; range: { location: number; length: number } }>` |

### Methods

```ts
adjustToFit(): Text
```

Deprecated setters: `font`, `systemFontSize`.

### Enums

`Text.Alignment` (string union):
- `'left'`
- `'right'`
- `'center'`
- `'justified'`
- `'natural'`

`Text.VerticalAlignment` (string union):
- `'top'`
- `'center'`
- `'bottom'`

`Text.LineSpacing` (string union):
- `'variable'`
- `'constantBaseline'`
- `'natural'`
- `'system'`

---

## SymbolMaster (extends Group)

### Constructor

```ts
new SymbolMaster(properties?: {
  name?: string
  frame?: Rectangle
  layers?: Layer[]
  background?: { enabled; includedInExport; includedInInstance; color }
  exportFormats?: ExportFormat[]
})
```

### Extra properties

| Name | Type |
|---|---|
| `symbolId` | `string` |
| `overrides` | `Override[]` |

(Inherits `background` from Group.)

### Static methods

```ts
SymbolMaster.fromFrame(frame: Group): SymbolMaster
SymbolMaster.fromArtboard(artboard: Artboard): SymbolMaster    // deprecated alias of fromFrame
```

### Instance methods

```ts
toArtboard(): Artboard
createNewInstance(): SymbolInstance
getAllInstances(): SymbolInstance[]
getLibrary(): Library | { type: 'Library'; id: string; name: string; enabled: false; valid: false } | null
syncWithLibrary(): boolean
unlinkFromLibrary(): boolean
getParentArtboard(): undefined
```

---

## SymbolInstance (extends Layer / StyledLayer)

### Constructor

```ts
new SymbolInstance(properties?: {
  symbolId: string
  frame?: Rectangle
  // plus all Layer properties
})
```

### Extra properties

| Name | Type |
|---|---|
| `symbolId` | `string` |
| `master` | `SymbolMaster` |
| `overrides` | `Override[]` |

### Instance methods

```ts
detach(options?: { recursively?: boolean }): Group | null
setOverrideValue(override: Override, value: string | ImageData | Swatch | Color): SymbolInstance
resizeWithSmartLayout(): SymbolInstance
overridesForExpandedLayer(expandedLayer: Layer): Override[]
```

---

## Override (symbol override)

Not directly constructable.

| Property | Type | Notes |
|---|---|---|
| `id` | `string` | read-only |
| `path` | `string` | `/`-joined nested object IDs |
| `property` | `'stringValue' \| 'symbolID' \| 'layerStyle' \| 'textStyle' \| 'image' \| 'flowDestination'` | |
| `symbolOverride` | `boolean` | is this a nested-symbol override? |
| `colorOverride` | `boolean` | read-only |
| `value` | `string \| ImageData` | |
| `isDefault` | `boolean` | read-only |
| `defaultValue` | `string \| ImageData` | read-only |
| `affectedLayer` | `Text \| Image \| SymbolInstance \| SymbolMaster` | read-only |
| `editable` | `boolean` | |
| `selected` | `boolean \| undefined` | |
| `defaultSwatchValue` | `Swatch \| undefined` | read-only |

```ts
getFrame(): Rectangle
```

---

## HotSpot (extends Layer)

Interactive hotspot with a `flow`.

### Constructor

```ts
new HotSpot(properties?: {
  name?: string
  parent?: Group
  frame?: Rectangle
  flow?: Flow
})
```

### Static methods

```ts
HotSpot.fromLayer(layer: Layer): HotSpot   // layer must already have a flow
```

HotSpot removes `exportFormats` and `transform` from Layer properties.

---

## Slice (extends Layer)

### Constructor

```ts
new Slice(properties?: {
  name?: string
  parent?: Group
  frame?: Rectangle
  exportFormats?: ExportFormat[]
})
```

Slice removes `flow` and `transform` from Layer properties.

---

## Style

Not constructed directly — accessed via `layer.style`.

### Properties (common)

| Name | Type |
|---|---|
| `opacity` | `number` (0..1) |
| `blendingMode` | `Style.BlendingMode` |
| `blurs` | `Blur[]` (0-1 items) |
| `fills` | `Fill[]` |
| `borders` | `Border[]` |
| `borderOptions` | `BorderOptions` |
| `shadows` | `Shadow[]` |
| `innerShadows` | `Shadow[]` |
| `corners` | `Corners` |
| `progressiveAlpha` | `Gradient \| undefined` |
| `tint` | `Fill \| undefined` (Group only) |
| `styleType` | `SharedStyle.StyleType` (`'Text' \| 'Layer' \| 'Unknown'`) |

### Text-specific properties

| Name | Type |
|---|---|
| `alignment` | `Text.Alignment` |
| `verticalAlignment` | `Text.VerticalAlignment` |
| `kerning` | `number \| null` |
| `lineHeight` | `number \| null` |
| `paragraphSpacing` | `number` |
| `textColor` | `string` (`#rrggbbaa`) |
| `textSwatch` | `Swatch \| undefined` |
| `fontSize` | `number` |
| `textTransform` | `'none' \| 'uppercase' \| 'lowercase'` |
| `fontFamily` | `string` (use `'system'` for OS default) |
| `fontWeight` | `number` (0..12) |
| `fontStyle` | `'italic' \| undefined` |
| `fontVariant` | `'small-caps' \| undefined` |
| `fontStretch` | `'compressed' \| 'condensed' \| 'narrow' \| 'expanded' \| 'poster' \| undefined` |
| `textUnderline` | `string` (e.g. `'single'`, `'single by-word'`) |
| `textStrikethrough` | `string` |
| `fontAxes` | `FontAxes` |

### Methods

```ts
getDefaultLineHeight(): number | undefined
isOutOfSyncWithSharedStyle(sharedStyle: SharedStyle): boolean
syncWithSharedStyle(sharedStyle: SharedStyle): void
static Style.colorFromString(color: string): NSColor
static Style.colorToString(color: NSColor): string
```

### Enums

`Style.BlendingMode` (string union, **verbatim from source**):
`'Normal'`, `'Darken'`, `'Multiply'`, `'ColorBurn'`, `'Lighten'`, `'Screen'`,
`'ColorDodge'`, `'Overlay'`, `'SoftLight'`, `'HardLight'`, `'Difference'`,
`'Exclusion'`, `'Hue'`, `'Saturation'`, `'Color'`, `'Luminosity'`,
`'PlusDarker'`, `'PlusLighter'`.

`Style.BlurType`:
`'Gaussian'`, `'Motion'`, `'Zoom'`, `'Background'`, `'Glass'`.

`Style.FillType`:
`'Color'`, `'Gradient'`, `'Pattern'` (lowercase aliases `'color'`, `'gradient'`, `'pattern'` accepted, deprecated).

`Style.PatternFillType`:
`'Tile'`, `'Fill'`, `'Stretch'`, `'Fit'`.

`Style.BorderPosition`:
`'Center'`, `'Inside'`, `'Outside'`, `'Both'` *(internal, do not use)*.

`Style.Arrowhead`:
`'None'`, `'OpenArrow'`, `'FilledArrow'`, `'Line'`, `'OpenCircle'`, `'FilledCircle'`, `'OpenSquare'`, `'FilledSquare'`
(deprecated alias: `'ClosedArrow'` == `'FilledArrow'`).

`Style.LineEnd`:
`'Butt'`, `'Round'`, `'Projecting'`.

`Style.LineJoin`:
`'Mitter'` (note: the enum key is `Miter` but value is `'Mitter'` — typo preserved from source), `'Round'`, `'Bevel'`.

`Style.GradientType`:
`'Linear'`, `'Radial'`, `'Angular'`.

`Style.CornerStyle` (integer-enum-ish — see Corners below):
`Auto` (-1), `Rounded` (0), `Smooth` (1), `Angled` (2), `InsideSquare` (3), `InsideArc` (4).

---

## Fill

```ts
interface Fill {
  fillType: Style.FillType
  color: string                 // rgba hex, e.g. '#000000ff'
  swatch?: Swatch
  gradient: Gradient
  pattern: {
    patternType: Style.PatternFillType
    image: ImageData | null
    tileScale: number
  }
  enabled: boolean
  blendingMode: Style.BlendingMode
}
```

---

## Border

```ts
interface Border {
  fillType: Style.FillType
  color: string
  swatch?: Swatch
  gradient: Gradient
  enabled: boolean
  position: Style.BorderPosition
  thickness: number
  blendingMode: Style.BlendingMode
  hasIndividualSides: boolean
  sides: { left: number; top: number; right: number; bottom: number }
}
```

---

## BorderOptions

```ts
interface BorderOptions {
  startArrowhead: Style.Arrowhead
  endArrowhead: Style.Arrowhead
  dashPattern: number[]
  lineEnd: Style.LineEnd
  lineJoin: Style.LineJoin
}
```

---

## Shadow

```ts
interface Shadow {
  color: string
  swatch?: Swatch
  blur: number
  x: number
  y: number
  spread: number
  enabled: boolean
  isInnerShadow: boolean
  blendingMode: Style.BlendingMode
}
```

---

## Blur

```ts
interface Blur {
  blurType: Style.BlurType
  radius: number
  enabled: boolean

  // Motion
  motionAngle?: number

  // Zoom
  center?: { x: number; y: number }

  // Background
  saturation?: number                  // 0..2

  // Glass
  brightness?: number                  // 0..2
  distortion?: number                  // 0..1
  depth?: number                       // 0..1
  chromaticAberration?: number         // 0..1
  hasSpecularHighlights?: boolean

  // Progressive
  progressive?: boolean
  gradient?: Gradient
}
```

---

## Gradient

```ts
interface Gradient {
  gradientType: Style.GradientType
  from: Point
  to: Point
  aspectRatio: number                  // radial only
  stops: GradientStop[]
}
```

## GradientStop

```ts
interface GradientStop {
  position: number      // 0..1
  color: string         // rgba hex
  swatch?: Swatch
  alpha: number
}
```

---

## Corners

Owned via `style.corners`.

```ts
interface Corners {
  radii: number | number[]
  style: Style.CornerStyle
  concentric: boolean
  smoothing: number                    // 0..1
  radiusAt(idx: number): number | undefined
}
```

---

## FontAxes

For variable fonts. Keys are axis names (e.g. `'wght'`, `'wdth'`).

```ts
interface FontAxes {
  [axisName: string]: {
    id: string
    min: number
    max: number
    value: number
  }
}
```

---

## SharedStyle

### Constructor

```ts
// Use document.sharedLayerStyles.push / sharedTextStyles.push or:
SharedStyle.fromStyle({ name: string; style: Style; document: Document }): SharedStyle
```

### Properties

| Name | Type | RO |
|---|---|---|
| `id` | `string` | yes |
| `styleType` | `SharedStyle.StyleType` | yes |
| `name` | `string` | |
| `style` | `Style` | |

### Methods

```ts
getAllInstances(): Style[]
getAllInstancesLayers(): Layer[]
getLibrary(): Library | null
syncWithLibrary(): boolean
unlinkFromLibrary(): boolean
```

### Enum

`SharedStyle.StyleType`:
- `'Text'`
- `'Layer'`
- `'Unknown'`

---

## Flow

Used as `layer.flow`. Created inline when setting: `shape.flow = { target: artboard }`.

### Properties

| Name | Type |
|---|---|
| `target` | `Artboard \| 'back'` |
| `targetId` | `string \| 'back'` |
| `animationType` | `Flow.AnimationType` |
| `maintainScrollPosition` | `boolean` |

### Methods

```ts
isBackAction(): boolean
isValidConnection(): boolean
static Flow.from(input: Flow | native | { target?; targetId? }): Flow
```

### Constants

```ts
Flow.BackTarget: 'back'
```

### Enum

`Flow.AnimationType` (string union, **verbatim**):
- `'none'`
- `'slideFromRight'`
- `'slideFromLeft'`
- `'slideFromBottom'`
- `'slideFromTop'`

---

## ExportFormat

Owned via `layer.exportFormats`.

```ts
interface ExportFormat {
  fileFormat: 'jpg' | 'png' | 'tiff' | 'eps' | 'pdf' | 'webp' | 'svg'
  prefix?: string                      // mutually exclusive with suffix
  suffix?: string
  size: string                         // e.g. '1x', '2x', '100w', '300h', '50px'
}
```

---

## Swatch (Color Variable)

Owned via `document.swatches`.

```ts
class Swatch {
  name: string
  color: string                        // rgba hex
  referencingColor: NSColor            // read-only, auto-updates

  static from(value: Swatch | string | NSColor): Swatch | undefined
}
```

---

## ColorAsset

```ts
interface ColorAsset {
  name: string | null
  color: string
}
```

---

## GradientAsset

```ts
interface GradientAsset {
  name: string | null
  gradient: Gradient
}
```

---

## StackLayout

Used via `group.stackLayout = { direction: StackLayout.Direction.Row, ... }`.

### Constructor

```ts
new StackLayout(properties?: {
  direction?: StackLayout.Direction
  justifyContent?: StackLayout.JustifyContent
  alignItems?: StackLayout.AlignItems
  gap?: number
  padding?: number | { top?; left?; bottom?; right?; vertical?; horizontal? }
  wraps?: boolean
  alignContent?: StackLayout.JustifyContent
  crossAxisGap?: number
})
```

### Properties

| Name | Type |
|---|---|
| `direction` | `StackLayout.Direction` |
| `justifyContent` | `StackLayout.JustifyContent` |
| `alignItems` | `StackLayout.AlignItems` |
| `gap` | `number` |
| `padding` | `number \| { top; left; bottom; right; vertical; horizontal }` |
| `wraps` | `boolean` |
| `alignContent` | `StackLayout.JustifyContent` |
| `crossAxisGap` | `number` |

### Methods

```ts
apply(): void
```

### Stack-item properties on child Layers

Defined via `defineStackItemLayerProperties`. A child layer in a stack can have:

| Name | Type |
|---|---|
| `flex` | `number` |
| `alignSelf` | `StackLayout.AlignItems` |
| `ignoresStackLayout` | `boolean` |
| `preservesSpaceInStackLayoutWhenHidden` | `boolean` |

### Enums

`StackLayout.Direction` (integer enum):
- `Row = 0` (horizontal)
- `Column = 1` (vertical)

`StackLayout.JustifyContent` (integer enum):
- `Start = 0`
- `Center = 1`
- `End = 2`
- `Between = 3`
- `Around = 4`
- `Evenly = 5`

`StackLayout.AlignItems` (integer enum):
- `Start = 0`
- `Center = 1`
- `End = 2`
- `Stretch = 3`
- `None = 5`

---

## SmartLayout (Legacy)

Static object. Each key is a preset `{ axis, layoutAnchor }`.

```ts
SmartLayout.LeftToRight         // { axis: 0, layoutAnchor: 0 }
SmartLayout.HorizontallyCenter  // { axis: 0, layoutAnchor: 1 }
SmartLayout.RightToLeft         // { axis: 0, layoutAnchor: 2 }
SmartLayout.TopToBottom         // { axis: 1, layoutAnchor: 0 }
SmartLayout.VerticallyCenter    // { axis: 1, layoutAnchor: 1 }
SmartLayout.BottomToTop         // { axis: 1, layoutAnchor: 2 }
```

---

## FlexSizing (enum)

Used for `layer.horizontalSizing` / `verticalSizing`.

- `Fixed`
- `Fit`
- `Fill`
- `Relative`

## Pin (enum)

Used for `layer.horizontalPins` / `verticalPins`.

- `None`
- `Min`
- `Max`
- `Both`

---

## Selection

Not directly constructed — accessed via `page.selectedLayers` / `document.selectedLayers`.

### Properties

| Name | Type | RO |
|---|---|---|
| `layers` | `Layer[]` | (setter replaces selection) |
| `length` | `number` | yes |
| `isEmpty` | `boolean` | yes |

### Methods

```ts
forEach(fn: (layer: Layer, index: number, all: Layer[]) => void): void
map<T>(fn: (layer: Layer, index: number, all: Layer[]) => T): T[]
reduce<T>(fn: (acc: T, layer: Layer) => T, initial: T): T
filter(fn: (layer: Layer) => boolean): Layer[]
clear(): Selection

[Symbol.iterator](): IterableIterator<Layer>
// Also array-indexable: selection[0], selection[1]…
```

Not in the public class (despite some older docs) - `each`, `reverse`, `slice`, `splice`, `includes`, `some`, `every`, `find`.

---

## Rectangle

### Constructor

```ts
new Rectangle(x: number, y: number, width: number, height: number)
new Rectangle(rect: Rectangle | { x; y; width; height } | { origin: { x; y }; size: { width; height } })
```

### Properties

- `x: number`
- `y: number`
- `width: number`
- `height: number`

### Methods

```ts
offset(x: number, y: number): Rectangle
scale(factorWidth: number, factorHeight?: number): Rectangle
changeBasis(opts: { from?: Layer; to?: Layer }): Rectangle
asCGRect(): CGRect
asNSRect(): NSRect
toString(): string
toJSON(): { x; y; width; height }
```

---

## Point

### Constructor

```ts
new Point(x: number, y: number)
new Point(p: Point | { x; y })
```

### Properties

- `x: number`
- `y: number`

### Methods

```ts
asCGPoint(): CGPoint
asNSPoint(): NSPoint
toJSON(): { x; y }
```

---

## Size

No dedicated `Size` class in the API. Anonymous `{ width: number; height: number }` objects are used.

---

## UI module — `require('sketch/ui')`

All function signatures verbatim from source.

### `UI.message(text, document?)`

```ts
UI.message(text: string, document?: Document): void
```

Shows a small, temporary, single-line message at the bottom of the specified
(or currently active) document. No-op if there's no frontmost document.

### `UI.alert(title, text)`

```ts
UI.alert(title: string, text: string): number  // NSModalResponse
```

Modal alert with an "OK" button. Returns the NS modal response integer.
The plugin's `alertIcon` is used as the alert icon when available.

### `UI.INPUT_TYPE`

String union:
- `'string'`
- `'slider'`
- `'selection'`

(Reserved but unreleased: `'number'`, `'color'`, `'path'`.)

### `UI.getInputFromUser(message, options?, callback?)`

```ts
UI.getInputFromUser(
  message: string,
  options?: {
    description?: string
    type?: UI.INPUT_TYPE                 // default 'string'
    initialValue?: string | number
    numberOfLines?: number               // enables multi-line textarea mode when type='string'
    possibleValues?: string[]            // required when type='selection'
    minValue?: number                    // slider
    maxValue?: number                    // slider
    increment?: number                   // slider: snaps to tick marks
    okButton?: string                    // default 'OK'
    cancelButton?: string                // default 'Cancel'
  },
  callback?: (err: Error | null, value?: string | number) => void
): void
```

- When `type === 'string'` and `numberOfLines` is set, a multi-line text area is shown; value returned as `string`.
- When `type === 'slider'`, value returned as `number`.
- When `type === 'selection'`, value returned as one of `possibleValues` (string).
- Cancellation passes an `Error('user canceled input')` to the callback.

### `UI.getStringFromUser(msg, initial?)` — **deprecated**

```ts
UI.getStringFromUser(msg: string, initial?: string): string
```

Synchronous. Prefer `getInputFromUser`.

### `UI.getSelectionFromUser(msg, items, selectedItemIndex?)` — **deprecated**

```ts
UI.getSelectionFromUser(
  msg: string,
  items: string[],
  selectedItemIndex?: number
): [responseCode: number, selection: number, ok: boolean]
```

Synchronous. Prefer `getInputFromUser`.

### `UI.getTheme()`

```ts
UI.getTheme(): 'light' | 'dark'
```

---

## Settings module — `require('sketch/settings')`

All values are JSON-serialized on set; JSON-parsed on get.

```ts
// Plugin-scoped (persists across Sketch launches, scoped to current plugin bundle)
Settings.settingForKey(key: string): any | undefined
Settings.setSettingForKey(key: string, value: any): void

// System-wide (NSUserDefaults on com.bohemiancoding.sketch3)
Settings.globalSettingForKey(key: string): any | undefined
Settings.setGlobalSettingForKey(key: string, value: any): void

// Per-document
Settings.documentSettingForKey(document: Document, key: string): any | undefined
Settings.setDocumentSettingForKey(document: Document, key: string, value: any): void

// Per-layer (also accepts Override and DataOverride as `layer`)
Settings.layerSettingForKey(
  layer: Layer | Override | DataOverride,
  key: string
): any | undefined
Settings.setLayerSettingForKey(
  layer: Layer | Override | DataOverride,
  key: string,
  value: any
): void

// Session (persists until Sketch quits, plugin-scoped)
Settings.sessionVariable(key: string): any | undefined
Settings.setSessionVariable(key: string, value: any): void
```

Setting a value to `undefined` deletes the entry.

---

## Async module — `require('sketch/async')`

### `createFiber()`

```ts
Async.createFiber(): Fiber
```

Fibers keep the plugin's JS context alive across async operations. Create one
before starting an async task; call `fiber.cleanup()` when done.

### `Fiber` type

```ts
interface Fiber {
  cleanup(): void
  onCleanup(handler: () => void): void
}
```

Do cleanup work inside `onCleanup` rather than before `cleanup()` - Sketch may
terminate the fiber itself.

---

## DataSupplier module — `require('sketch/data-supplier')`

```ts
DataSupplier.registerDataSupplier(
  dataType: 'public.text' | 'public.image',
  dataName: string,                                  // menu title
  dynamicDataKey: string                             // action identifier (typically plugin command name)
): void

DataSupplier.deregisterDataSuppliers(): void

// Called from the action handler once data is ready:
DataSupplier.supplyData(key: string, data: string[] | ImageData[]): void

// Supply one piece of data for one index:
DataSupplier.supplyDataAtIndex(key: string, datum: string | ImageData, index: number): void
```

Call `registerDataSupplier` from the plugin's Startup handler;
call `deregisterDataSuppliers` from its Shutdown handler.
Call `supplyData` / `supplyDataAtIndex` from the action handler that the Data menu invokes;
the `context.data.key` value passed to that handler is what you must pass back as `key`.

---

## Types (string-literal registry)

`require('sketch/dom').Types` — every `type` value any wrapped object may have:

```
'Group', 'Page', 'Artboard', 'Shape', 'Style', 'Blur', 'Border',
'BorderOptions', 'BorderSides', 'Fill', 'Gradient', 'GradientStop',
'Shadow', 'Image', 'Text', 'Document', 'Library', 'StackLayout',
'SymbolMaster', 'SymbolInstance', 'Override', 'ImageData', 'Flow',
'HotSpot', 'ImportableObject', 'SharedStyle', 'DataOverride',
'ShapePath', 'Slice', 'ExportFormat', 'CurvePoint', 'ColorAsset',
'GradientAsset', 'Swatch'
```

---

## Callback / event-handler signatures (summary)

```ts
// Document.open
(err: Error | null, document?: Document) => void

// Document.save
(err: Error | null) => void

// Library.getRemoteLibraryWithRSS
(err: Error | null, library?: Library) => void

// Layer.export (when invoked with an output path)
(err: Error | null) => void

// Image.removeBackground / Image.removeBackgroundFromLayers
(err: Error | undefined) => void

// UI.getInputFromUser
(err: Error | null, value?: string | number) => void

// Async Fiber.onCleanup
() => void
```

---

## Notes on `Size` etc.

There is no distinct `Size` class; `{ width, height }` object literals are
used throughout (e.g., `ImageData.size`, `blur.center`). Similarly, color
values are `#rrggbbaa` strings everywhere except where a `Swatch` or
`referencingColor` is expected.

## Notes on Style defaults

When a style property is never set, `Style` defaults to `{ fills: [] }` on
non-text layers. On Text layers the default text style is seeded from
`MSDefaultTextStyle.defaultTextStyle()`.
