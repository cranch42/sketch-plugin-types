# Sketch Plugin Action API — Reference Inventory

Source: https://developer.sketch.com/reference/action/ and https://developer.sketch.com/plugins/actions (as of 2026-04-16 / retrieved 2026-04-18).

This document is the raw research input for the TypeScript typings of the `handlers.actions` map in a Sketch plugin's `manifest.json`, and for the shape of `context` / `context.actionContext` delivered to each handler.

Important meta-finding: the index lists 323+ action names, but only a small subset (about 11) have documented `actionContext` payloads. The rest explicitly read "No details available for `<ActionName>`" on their dedicated pages. For those, plugins still receive a `context` object, but `context.actionContext` is either `undefined` or an undocumented implementation-specific shape. Typings should therefore emit `unknown` (or an opt-in `any`) for undocumented actions and strong types only for the documented ones.

---

## 1. General handler signature

### 1.1 Registering a handler in `manifest.json`

Handlers are declared per command, inside `handlers.actions`, mapping an action name (optionally with a `.begin` / `.finish` phase suffix) to a function name exported by the command's script:

```json
{
  "commands": [
    {
      "script": "my-action-listener.js",
      "name": "My Action Listener",
      "identifier": "my-action-listener-identifier",
      "handlers": {
        "actions": {
          "OpenDocument": "onOpenDocument",
          "SelectionChanged.finish": "onSelectionFinished"
        }
      }
    }
  ]
}
```

Keys:
- Bare action name (e.g. `"OpenDocument"`) — handler fires for every phase of the action (both `.begin` and `.finish` if the action has phases).
- `"<Action>.begin"` — handler fires only at the start of the action.
- `"<Action>.finish"` — handler fires only at the end of the action.

Values: string, the name of a top-level exported function in the command's `script`.

### 1.2 Handler function shape

```ts
export function onOpenDocument(context: ActionContext<'OpenDocument'>): void {
  context.actionContext.document.showMessage('Document Opened');
}
```

The handler receives a single `context` argument. Documented shape:

```ts
interface HandlerContext<Name extends string = string> {
  /** Action-specific payload. `undefined` for actions that do not set one yet. */
  actionContext: ActionContextMap[Name] | undefined;
  /** Other fields (document, api, scriptPath, scriptURL, command, plugin) are
   *  observed in practice but are not explicitly documented in the Action API
   *  guide. They come from the general plugin command context. */
}
```

### 1.3 Cancellation / preventing default

Not documented. The official guide does not describe a cancel / preventDefault mechanism, and no individual action page says it is cancellable. Treat all actions as observational.

### 1.4 Phase suffixes (`.begin` / `.finish`)

- Phases exist on some actions (the guide says "some actions occur in two phases").
- The documentation does not enumerate which specific actions have phases. The `.begin` / `.finish` pages do not exist as separate reference pages (they 404).
- Convention: when the action has phases, register `"<Action>.begin"` or `"<Action>.finish"`; otherwise the bare name handles everything.

### 1.5 Return values

Not documented. Handlers are expected to be side-effecting. The guide does not mention return semantics.

---

## 2. Documented actions (with `actionContext` payload)

These are the actions whose reference pages provide an `actionContext` shape. For every other name in Section 3, the page says "No details available."

### 2.1 `OpenDocument`

- Description: Triggered when a document is opened.
- Cancellable: not specified.
- Phase variants: not documented.
- actionContext: not specified on the reference page. The Action API guide's example uses `context.actionContext.document.showMessage(...)`, which implies a `document` field is present, but the reference page does not list fields.

```ts
interface OpenDocumentContext {
  // Inferred from the guide example, not explicitly typed on the reference page.
  document: Document;
}
```

### 2.2 `CloseDocument`

- Description: Triggered when a document is closed.
- Cancellable: not specified.
- actionContext: not specified on the reference page.

```ts
interface CloseDocumentContext {
  // No fields documented. Likely contains `document`, but undocumented.
  document?: Document;
}
```

### 2.3 `Startup`

- Description: Triggered when Sketch loads a plugin. Fires on plugin install, re-enable, or Sketch launch.
- Intended use: read user settings, download data, initialise plugin state.
- Cancellable: not specified.
- actionContext: no fields documented.

```ts
interface StartupContext {}
```

### 2.4 `Shutdown`

- Description: Triggered when Sketch unloads a plugin. Fires on plugin disable, uninstall, or Sketch shutdown.
- Intended use: clean up plugin data, persist state between sessions.
- Cancellable: not specified.
- actionContext: no fields documented.

```ts
interface ShutdownContext {}
```

### 2.5 `SelectionChanged`

- Description: Triggered whenever the user changes which layers are selected in a document.
- Cancellable: not specified.
- Phase variants: not documented, but because the Action API guide uses `SelectionChanged` as its canonical example of an action that accepts `.begin`/`.finish` suffixes, it is reasonable to assume both phases exist.

```ts
interface SelectionChangedContext {
  document: Document;
  oldSelection: Layer[];
  newSelection: Layer[];
}
```

### 2.6 `LayersMoved`

- Description: Triggered when one or more layers are moved by the user.
- Cancellable: not specified.
- Quirks: fires per-batch (the `layers` array contains every layer that moved in the gesture), not once per layer.

```ts
interface LayersMovedContext {
  document: Document;
  layers: Layer[];
}
```

### 2.7 `LayersResized`

- Description: Triggered when one or more layers are resized by the user.
- Cancellable: not specified.
- Quirks: batched (array may contain multiple layers from a single resize gesture).

```ts
interface LayersResizedContext {
  document: Document;
  layers: Layer[];
}
```

### 2.8 `TextChanged`

- Description: Triggered when the contents of a Text Layer are modified.
- Cancellable: not specified.
- Quirks / version note: prior to Sketch 2026.1 the action context included `old` and `new` keys (previous and updated text). Those have been removed — plugins that need before/after comparison must now track the change themselves.

```ts
interface TextChangedContext {
  layer: Layer;
  /** @deprecated Removed in Sketch 2026.1. Kept only as a note. */
  // old?: string;
  // new?: string;
}
```

### 2.9 `ArtboardChanged`

- Description: Triggered when the currently active artboard changes. Fires when an artboard is added, an artboard is selected, or an artboard is removed.
- Cancellable: not specified.
- Quirks: `newArtboard` is `null` when the change is an artboard removal. `oldArtboard` can also be `null` in add scenarios.

```ts
interface ArtboardChangedContext {
  document: Document;
  oldArtboard: Artboard | null;
  newArtboard: Artboard | null;
}
```

### 2.10 `DocumentSaved`

- Description: Triggered when a document is saved. Fires for both manual saves and OS-level auto-saves.
- Cancellable: not specified.
- Quirks: use `autoSaved` to distinguish user-initiated saves (`false`) from auto-saves (`true`).

```ts
interface DocumentSavedContext {
  document: Document;
  /** File size of the saved document, in bytes. */
  size: number;
  /** true if the OS triggered an auto-save, false for a manual save. */
  autoSaved: boolean;
}
```

### 2.11 `HandleURL`

- Description: Triggered when Sketch is launched with a URL of the form `sketch://plugin/my.plugin.identifier/my.command.identifier[?query]`.
- Cancellable: not specified.
- Quirks: the `url` field is an `NSURL` (Objective-C bridged type), not a JS `URL`. `path` is everything after `sketch://plugin`.

```ts
interface HandleURLContext {
  /** NSURL instance — the URL that triggered the action. */
  url: NSURL;
  /** Everything after `sketch://plugin`, e.g. `/my.plugin.identifier/my.command.identifier`. */
  path: string;
  /** Parsed query string as a plain object.
   *  For `?foo=bar&baz=qux`, this is { foo: 'bar', baz: 'qux' }. */
  query: Record<string, string>;
}
```

### 2.12 `ExportSlices`

- Description: Triggered whenever the user exports artboards, layers or slices.
- Cancellable: not specified.
- Quirks: inspect each entry's `path` extension (e.g. `.svg`, `.png`) to filter by format. `document` is currently typed as `MSImmutableDocumentData`; the docs note this may change to `MSDocument` in the future.

```ts
interface ExportSlicesContext {
  document: MSImmutableDocumentData;
  exports: Array<{
    /** Native MSExportRequest (scale, format, trimming, etc.). */
    request: MSExportRequest;
    /** Absolute filesystem path of the exported file. */
    path: string;
  }>;
}
```

### 2.13 Actions with a description but no payload

A handful of actions have a short description on their page but still no documented `actionContext` fields. They should type `actionContext` as `unknown` (or an empty object) in the typings:

- `ApplySharedLayerStyle` — triggered when a shared Layer Style is applied to a layer using the Inspector.
- `ApplySharedTextStyle` — triggered when a shared Text Style is applied to a text layer using the Inspector.
- `ToggleFill` — triggered when the fill for a selected shape is toggled with the `f` keyboard shortcut.
- `ToggleBorder` — triggered when the border for a selected shape is toggled with the `b` keyboard shortcut.

---

## 3. Full list of registered action names (exhaustive)

The index page enumerates the following action names. Every name below is registerable as a key inside `handlers.actions` (with or without `.begin` / `.finish` suffixes). Unless the action appears in Section 2, its reference page states "No details available" and `actionContext` should be typed as `unknown`.

1. `AddAsLibrary`
2. `AddBorder`
3. `AddExportFormat`
4. `AddFill`
5. `AddFlow`
6. `AddFlowBack`
7. `AddFlowHome`
8. `AddInnerShadow`
9. `AddShadow`
10. `AlignBottom`
11. `AlignCenter`
12. `AlignJustified`
13. `AlignLayersBottom`
14. `AlignLayersCenter`
15. `AlignLayersLeft`
16. `AlignLayersMiddle`
17. `AlignLayersRight`
18. `AlignLayersTop`
19. `AlignLeft`
20. `AlignMiddle`
21. `AlignRight`
22. `AlignTop`
23. `AlignmentActions`
24. `ApplyData`
25. `ApplyHorizontalFlip`
26. `ApplyLandscapeOrientation`
27. `ApplyPortraitOrientation`
28. `ApplySharedLayerStyle` — described
29. `ApplySharedTextStyle` — described
30. `ApplyVerticalFlip`
31. `ArtboardChanged` — **documented payload**
32. `AssignColorSpace`
33. `Assistant`
34. `AssistantActivate`
35. `AssistantCheckDocument`
36. `AssistantCheckDocumentAutomatically`
37. `AssistantConfigure`
38. `AssistantInstallFromDisk`
39. `AssistantInstallFromURL`
40. `AssistantInstallMissing`
41. `AssistantShowIgnored`
42. `AutoExpandGroups`
43. `BackToInstance`
44. `BadgeMenu`
45. `BaseAlignLayers`
46. `BaseStyle`
47. `BooleanActionGroup`
48. `BooleanMenu`
49. `CenterLayersInCanvas`
50. `CenterSelectionInVisibleArea`
51. `ChangeFlowAnimationFromBottomAnimation`
52. `ChangeFlowAnimationFromLeftAnimation`
53. `ChangeFlowAnimationFromRightAnimation`
54. `ChangeFlowAnimationFromTopAnimation`
55. `ChangeFlowAnimationNoAnimation`
56. `ChangeFont`
57. `ChangeInferredLayout`
58. `ClearDataRecord`
59. `ClippingMask`
60. `ClippingMaskMode`
61. `CloseDocument` — **documented (description only)**
62. `ClosePath`
63. `Cloud`
64. `CollapseAllGroups`
65. `ColorInspectorCircularGradientTab`
66. `ColorInspectorColorTab`
67. `ColorInspectorImageTab`
68. `ColorInspectorLinearGradientTab`
69. `ColorInspectorModeBorderTouchBarGroup`
70. `ColorInspectorModeFillTouchBarGroup`
71. `ColorInspectorModePicker`
72. `ColorInspectorRadialGradientTab`
73. `ConstraintFixHeight`
74. `ConstraintFixWidth`
75. `ConstraintPinBottom`
76. `ConstraintPinLeft`
77. `ConstraintPinRight`
78. `ConstraintPinTop`
79. `ConstraintReset`
80. `ContextMenuData`
81. `ConvertColorSpace`
82. `ConvertFlowToHotspot`
83. `ConvertSymbolOrDetachInstances`
84. `ConvertSymbolOrDetachInstancesRecursively`
85. `ConvertToOutlines`
86. `Copy`
87. `CopyCSSAttributes`
88. `CopyCloudDocumentLink`
89. `CopyOverride`
90. `CopySVGCode`
91. `CopyStyle`
92. `CreateSharedColor`
93. `CreateSharedStyle`
94. `CreateSymbol`
95. `CurveModeAsymmetric`
96. `CurveModeDisconnected`
97. `CurveModeMirrored`
98. `CurveModeStraight`
99. `CurveModeTouchGroup`
100. `Cut`
101. `DataMenu`
102. `DefaultStyle`
103. `Delete`
104. `DetachSharedColor`
105. `DetachSharedStyle`
106. `Difference`
107. `DistributeActions`
108. `DistributeHorizontally`
109. `DistributeVertically`
110. `DocumentSaved` — **documented payload**
111. `Duplicate`
112. `Edit`
113. `EditColorSpace`
114. `Export`
115. `ExportPDFBook`
116. `ExportSelectionWithExportFormats`
117. `ExportSlices` — **documented payload**
118. `Find`
119. `Flatten`
120. `FlattenSelection`
121. `FlipHorizontal`
122. `FlipVertical`
123. `FollowFlow`
124. `ForceResyncLibrary`
125. `GridSettings`
126. `Group`
127. `GroupActionGroup`
128. `HandleURL` — **documented payload**
129. `HandlerGotFocus`
130. `HandlerLostFocus`
131. `HideAllGridsAndLayouts`
132. `HideLayer`
133. `IgnoreClippingMask`
134. `ImageOriginalSize`
135. `IncompatiblePluginsDisabled`
136. `InsertArrow`
137. `InsertArtboard`
138. `InsertHotspot`
139. `InsertImage`
140. `InsertLine`
141. `InsertMenu`
142. `InsertSharedText`
143. `InsertSlice`
144. `InsertSymbol`
145. `InsertTextLayer`
146. `InsertVector`
147. `Intersect`
148. `Join`
149. `LayerFocusActions`
150. `LayerHeightFocus`
151. `LayerWidthFocus`
152. `LayerXFocus`
153. `LayerYFocus`
154. `LayersMoved` — **documented payload**
155. `LayersResized` — **documented payload**
156. `LayoutSettings`
157. `LegacyInsertMenu`
158. `LicenseExpired`
159. `ListTypeActionBullet`
160. `ListTypeActionNone`
161. `ListTypeActionNumbered`
162. `LockLayer`
163. `Magnifier`
164. `MainMenuData`
165. `MakeGrid`
166. `MakeLowercase`
167. `MakeUppercase`
168. `ManageCloudDocumentShareSettings`
169. `MaskWithShape`
170. `Mirror`
171. `MoveActionGroup`
172. `MoveBackward`
173. `MoveForward`
174. `MoveToBack`
175. `MoveToFront`
176. `MoveToTop`
177. `MoveUpHierarchy`
178. `NavigateToOverrideMaster`
179. `NewPage`
180. `NextPage`
181. `OffsetPath`
182. `OpenDocument` — **documented (description only; implicit `document` field)**
183. `OpenPreview`
184. `OpenStyleInLibrary`
185. `OpenSwatchInLibrary`
186. `OpenSymbolInLibrary`
187. `OpenTypeFeatures`
188. `OrganizeImportedSymbols`
189. `OvalShape`
190. `Paste`
191. `PasteHere`
192. `PasteOverSelection`
193. `PasteStyle`
194. `PasteWithStyle`
195. `Pencil`
196. `PolygonShape`
197. `PreviewAtActualSize`
198. `PreviousPage`
199. `Print`
200. `RectangleShape`
201. `Redo`
202. `ReduceFileSize`
203. `ReduceImageSize`
204. `RefreshData`
205. `RemoveAllOverrides`
206. `RemoveFlow`
207. `RemoveSelectedOverrides`
208. `RemoveTextTransform`
209. `RemoveUnusedStyles`
210. `RenameLayer`
211. `ReplaceColor`
212. `ReplaceFonts`
213. `ReplaceImage`
214. `ReplaceOverride`
215. `ReplaceOverrideStyle`
216. `ReplaceOverrideSymbol`
217. `ReplaceWithSymbol`
218. `ReplaceWithSymbolRoot`
219. `ResetOrigin`
220. `ResetSharedColor`
221. `ResetSharedStyle`
222. `ResetSymbolSize`
223. `ResizeArtboardToFit`
224. `RevealInLayerList`
225. `ReversePath`
226. `Rotate`
227. `RotateClockwise`
228. `RotateCounterclockwise`
229. `RoundToPixel`
230. `RoundedRectangleShape`
231. `RunPluginCommand`
232. `SaveAsTemplate`
233. `Scale`
234. `Scissors`
235. `Search`
236. `SelectAll`
237. `SelectAllArtboards`
238. `SelectionChanged` — **documented payload**
239. `SendToSymbolsPage`
240. `Shape`
241. `ShowBorderOptions`
242. `ShowColors`
243. `ShowComponentsPane`
244. `ShowDocumentFonts`
245. `ShowFillOptions`
246. `ShowFonts`
247. `ShowLayerList`
248. `ShowReplaceColorSheet`
249. `Shutdown` — **documented (description only)**
250. `Sketch.MSAddComponent`
251. `Sketch.MSChangeComponentKindActionGroup`
252. `Sketch.MSChangeLayerStyleComponentKind`
253. `Sketch.MSChangeSwatchComponentKind`
254. `Sketch.MSChangeSymbolComponentKind`
255. `Sketch.MSChangeTextStyleComponentKind`
256. `Sketch.MSComponentsPicker`
257. `Sketch.MSContentMode`
258. `Sketch.MSCopyComponent`
259. `Sketch.MSDeleteComponent`
260. `Sketch.MSDuplicateComponent`
261. `Sketch.MSEditSymbolMasterComponent`
262. `Sketch.MSFilterComponentList`
263. `Sketch.MSGroupComponents`
264. `Sketch.MSInsertComponentInstance`
265. `Sketch.MSMaintainScrollPosition`
266. `Sketch.MSRenameComponent`
267. `Sketch.MSRenameSharedStyle`
268. `Sketch.MSRevealComponent`
269. `Sketch.MSRevealComponentsPanel`
270. `Sketch.MSTidy`
271. `Sketch.MSUngroupComponents`
272. `Sketch.MSVisitSymbolComponent`
273. `Sketch.ToggleLibraryListInComponentsPanel`
274. `SmartRotate`
275. `StarShape`
276. `Startup` — **documented (description only)**
277. `Subtract`
278. `SyncLibrary`
279. `SyncLocalColor`
280. `SyncLocalStyle`
281. `TextAlignTouchBarGroup`
282. `TextChanged` — **documented payload**
283. `TextOnPath`
284. `TextStyleTouchBar`
285. `ToggleAlignmentGuides`
286. `ToggleArtboardShadow`
287. `ToggleBorder` — described
288. `ToggleFill` — described
289. `ToggleFixToViewport`
290. `ToggleFlowInteraction`
291. `ToggleGrid`
292. `ToggleInspectorVisibility`
293. `ToggleInterface`
294. `ToggleLayerHighlight`
295. `ToggleLayout`
296. `TogglePixelGrid`
297. `TogglePixelLines`
298. `ToggleRulerDragLocking`
299. `ToggleRulers`
300. `ToggleSelection`
301. `ToggleSidebarVisibility`
302. `ToggleSliceInteraction`
303. `ToggleToolbarVisibility`
304. `ToolsMenu`
305. `Transform`
306. `TriangleShape`
307. `Underline`
308. `Undo`
309. `Ungroup`
310. `Union`
311. `UnlinkAndSyncFromLibrary`
312. `UnlinkFromLibrary`
313. `UpdatePlugins`
314. `ViewDocumentInDocumentsWindow`
315. `ViewMenu`
316. `ViewOnSketchCloudWeb`
317. `Zoom`
318. `ZoomActions`
319. `ZoomIn`
320. `ZoomOut`
321. `ZoomToActualSize`
322. `ZoomToArtboard`
323. `ZoomToSelection`

Total: 323 action names.

---

## 4. Suggested typings shape (guidance for the .d.ts)

```ts
// Strong types for the 9 actions that have documented payloads (+2 with implicit document,
// + 4 "described only" actions with no payload fields).
export interface SketchActionContextMap {
  OpenDocument: OpenDocumentContext;
  CloseDocument: CloseDocumentContext;
  Startup: StartupContext;
  Shutdown: ShutdownContext;
  SelectionChanged: SelectionChangedContext;
  LayersMoved: LayersMovedContext;
  LayersResized: LayersResizedContext;
  TextChanged: TextChangedContext;
  ArtboardChanged: ArtboardChangedContext;
  DocumentSaved: DocumentSavedContext;
  HandleURL: HandleURLContext;
  ExportSlices: ExportSlicesContext;
  ApplySharedLayerStyle: unknown;
  ApplySharedTextStyle: unknown;
  ToggleFill: unknown;
  ToggleBorder: unknown;
}

// Fallback: every other registered name from Section 3 maps to `unknown`.
export type SketchActionName =
  | keyof SketchActionContextMap
  | 'AddAsLibrary'
  | 'AddBorder'
  // ... (all 323 literals from Section 3)
  ;

export type SketchActionKey =
  | SketchActionName
  | `${SketchActionName}.begin`
  | `${SketchActionName}.finish`;

export interface SketchActionHandlersMap {
  [K: SketchActionKey]: string; // function name exported by the command script
}

export interface SketchHandlerContext<Name extends SketchActionName = SketchActionName> {
  actionContext: Name extends keyof SketchActionContextMap
    ? SketchActionContextMap[Name]
    : unknown;
}
```

Notes for the typings author:
- The `Document`, `Layer`, `Artboard` types should come from `sketch/dom` (the JS API package). `NSURL`, `MSImmutableDocumentData`, `MSExportRequest` are Objective-C bridged types — expose them as opaque `unknown` / branded types unless you are also typing the CocoaScript bridge.
- There is no documented cancel / preventDefault mechanism, so handlers should be typed as `(ctx) => void`.
- Phase suffixes are purely string-level; you do not need to vary the context type by phase.
