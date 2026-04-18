/// <reference path="./native.d.ts" />
/// <reference path="./dom.d.ts" />

/**
 * Action API typings. These are consumed by:
 *  - `manifest.json` via `handlers.actions` (keys of `SketchActionHandlersMap`)
 *  - per-command action handler functions (signature: `SketchActionHandler<Name>`)
 *
 * The runtime vocabulary covers 323 action names scraped from
 * https://developer.sketch.com/reference/action/. Only ~12 of them document a
 * concrete `actionContext` payload; the rest resolve to `unknown`.
 */

import * as Sketch from 'sketch/dom';

// ---------------------------------------------------------------------
// Documented action payloads
// ---------------------------------------------------------------------

export interface OpenDocumentContext {
    document: Sketch.Document;
}

export interface CloseDocumentContext {
    document?: Sketch.Document;
}

export interface StartupContext {}
export interface ShutdownContext {}

export interface SelectionChangedContext {
    document: Sketch.Document;
    oldSelection: Sketch.Layer[];
    newSelection: Sketch.Layer[];
}

export interface LayersMovedContext {
    document: Sketch.Document;
    layers: Sketch.Layer[];
}

export interface LayersResizedContext {
    document: Sketch.Document;
    layers: Sketch.Layer[];
}

export interface TextChangedContext {
    layer: Sketch.Text;
    // Note: prior to Sketch 2026.1 this context also carried `old` / `new`
    // string fields (previous and updated text). They were removed; plugins
    // that need before/after diffing must track the change themselves.
}

export interface ArtboardChangedContext {
    document: Sketch.Document;
    oldArtboard: Sketch.Artboard | null;
    newArtboard: Sketch.Artboard | null;
}

export interface DocumentSavedContext {
    document: Sketch.Document;
    /** File size of the saved document, in bytes. */
    size: number;
    /** `true` if the OS triggered an auto-save, `false` for a manual save. */
    autoSaved: boolean;
}

export interface HandleURLContext {
    /** The bridged `NSURL` that triggered the action. */
    url: SketchNative.NSURL;
    /** Everything after `sketch://plugin`. */
    path: string;
    /** Parsed `?key=value` pairs. */
    query: Record<string, string>;
}

export interface ExportSlicesContext {
    document: SketchNative.MSImmutableDocumentData;
    exports: Array<{
        /** Native `MSExportRequest` (scale, format, trimming, etc.). */
        request: SketchNative.MSExportRequest;
        /** Absolute filesystem path of the exported file. */
        path: string;
    }>;
}

// ---------------------------------------------------------------------
// Typed payload map
// ---------------------------------------------------------------------

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

// ---------------------------------------------------------------------
// Full name union (323 entries)
// ---------------------------------------------------------------------

export type SketchActionName =
    | 'AddAsLibrary'
    | 'AddBorder'
    | 'AddExportFormat'
    | 'AddFill'
    | 'AddFlow'
    | 'AddFlowBack'
    | 'AddFlowHome'
    | 'AddInnerShadow'
    | 'AddShadow'
    | 'AlignBottom'
    | 'AlignCenter'
    | 'AlignJustified'
    | 'AlignLayersBottom'
    | 'AlignLayersCenter'
    | 'AlignLayersLeft'
    | 'AlignLayersMiddle'
    | 'AlignLayersRight'
    | 'AlignLayersTop'
    | 'AlignLeft'
    | 'AlignMiddle'
    | 'AlignRight'
    | 'AlignTop'
    | 'AlignmentActions'
    | 'ApplyData'
    | 'ApplyHorizontalFlip'
    | 'ApplyLandscapeOrientation'
    | 'ApplyPortraitOrientation'
    | 'ApplySharedLayerStyle'
    | 'ApplySharedTextStyle'
    | 'ApplyVerticalFlip'
    | 'ArtboardChanged'
    | 'AssignColorSpace'
    | 'Assistant'
    | 'AssistantActivate'
    | 'AssistantCheckDocument'
    | 'AssistantCheckDocumentAutomatically'
    | 'AssistantConfigure'
    | 'AssistantInstallFromDisk'
    | 'AssistantInstallFromURL'
    | 'AssistantInstallMissing'
    | 'AssistantShowIgnored'
    | 'AutoExpandGroups'
    | 'BackToInstance'
    | 'BadgeMenu'
    | 'BaseAlignLayers'
    | 'BaseStyle'
    | 'BooleanActionGroup'
    | 'BooleanMenu'
    | 'CenterLayersInCanvas'
    | 'CenterSelectionInVisibleArea'
    | 'ChangeFlowAnimationFromBottomAnimation'
    | 'ChangeFlowAnimationFromLeftAnimation'
    | 'ChangeFlowAnimationFromRightAnimation'
    | 'ChangeFlowAnimationFromTopAnimation'
    | 'ChangeFlowAnimationNoAnimation'
    | 'ChangeFont'
    | 'ChangeInferredLayout'
    | 'ClearDataRecord'
    | 'ClippingMask'
    | 'ClippingMaskMode'
    | 'CloseDocument'
    | 'ClosePath'
    | 'Cloud'
    | 'CollapseAllGroups'
    | 'ColorInspectorCircularGradientTab'
    | 'ColorInspectorColorTab'
    | 'ColorInspectorImageTab'
    | 'ColorInspectorLinearGradientTab'
    | 'ColorInspectorModeBorderTouchBarGroup'
    | 'ColorInspectorModeFillTouchBarGroup'
    | 'ColorInspectorModePicker'
    | 'ColorInspectorRadialGradientTab'
    | 'ConstraintFixHeight'
    | 'ConstraintFixWidth'
    | 'ConstraintPinBottom'
    | 'ConstraintPinLeft'
    | 'ConstraintPinRight'
    | 'ConstraintPinTop'
    | 'ConstraintReset'
    | 'ContextMenuData'
    | 'ConvertColorSpace'
    | 'ConvertFlowToHotspot'
    | 'ConvertSymbolOrDetachInstances'
    | 'ConvertSymbolOrDetachInstancesRecursively'
    | 'ConvertToOutlines'
    | 'Copy'
    | 'CopyCSSAttributes'
    | 'CopyCloudDocumentLink'
    | 'CopyOverride'
    | 'CopySVGCode'
    | 'CopyStyle'
    | 'CreateSharedColor'
    | 'CreateSharedStyle'
    | 'CreateSymbol'
    | 'CurveModeAsymmetric'
    | 'CurveModeDisconnected'
    | 'CurveModeMirrored'
    | 'CurveModeStraight'
    | 'CurveModeTouchGroup'
    | 'Cut'
    | 'DataMenu'
    | 'DefaultStyle'
    | 'Delete'
    | 'DetachSharedColor'
    | 'DetachSharedStyle'
    | 'Difference'
    | 'DistributeActions'
    | 'DistributeHorizontally'
    | 'DistributeVertically'
    | 'DocumentSaved'
    | 'Duplicate'
    | 'Edit'
    | 'EditColorSpace'
    | 'Export'
    | 'ExportPDFBook'
    | 'ExportSelectionWithExportFormats'
    | 'ExportSlices'
    | 'Find'
    | 'Flatten'
    | 'FlattenSelection'
    | 'FlipHorizontal'
    | 'FlipVertical'
    | 'FollowFlow'
    | 'ForceResyncLibrary'
    | 'GridSettings'
    | 'Group'
    | 'GroupActionGroup'
    | 'HandleURL'
    | 'HandlerGotFocus'
    | 'HandlerLostFocus'
    | 'HideAllGridsAndLayouts'
    | 'HideLayer'
    | 'IgnoreClippingMask'
    | 'ImageOriginalSize'
    | 'IncompatiblePluginsDisabled'
    | 'InsertArrow'
    | 'InsertArtboard'
    | 'InsertHotspot'
    | 'InsertImage'
    | 'InsertLine'
    | 'InsertMenu'
    | 'InsertSharedText'
    | 'InsertSlice'
    | 'InsertSymbol'
    | 'InsertTextLayer'
    | 'InsertVector'
    | 'Intersect'
    | 'Join'
    | 'LayerFocusActions'
    | 'LayerHeightFocus'
    | 'LayerWidthFocus'
    | 'LayerXFocus'
    | 'LayerYFocus'
    | 'LayersMoved'
    | 'LayersResized'
    | 'LayoutSettings'
    | 'LegacyInsertMenu'
    | 'LicenseExpired'
    | 'ListTypeActionBullet'
    | 'ListTypeActionNone'
    | 'ListTypeActionNumbered'
    | 'LockLayer'
    | 'Magnifier'
    | 'MainMenuData'
    | 'MakeGrid'
    | 'MakeLowercase'
    | 'MakeUppercase'
    | 'ManageCloudDocumentShareSettings'
    | 'MaskWithShape'
    | 'Mirror'
    | 'MoveActionGroup'
    | 'MoveBackward'
    | 'MoveForward'
    | 'MoveToBack'
    | 'MoveToFront'
    | 'MoveToTop'
    | 'MoveUpHierarchy'
    | 'NavigateToOverrideMaster'
    | 'NewPage'
    | 'NextPage'
    | 'OffsetPath'
    | 'OpenDocument'
    | 'OpenPreview'
    | 'OpenStyleInLibrary'
    | 'OpenSwatchInLibrary'
    | 'OpenSymbolInLibrary'
    | 'OpenTypeFeatures'
    | 'OrganizeImportedSymbols'
    | 'OvalShape'
    | 'Paste'
    | 'PasteHere'
    | 'PasteOverSelection'
    | 'PasteStyle'
    | 'PasteWithStyle'
    | 'Pencil'
    | 'PolygonShape'
    | 'PreviewAtActualSize'
    | 'PreviousPage'
    | 'Print'
    | 'RectangleShape'
    | 'Redo'
    | 'ReduceFileSize'
    | 'ReduceImageSize'
    | 'RefreshData'
    | 'RemoveAllOverrides'
    | 'RemoveFlow'
    | 'RemoveSelectedOverrides'
    | 'RemoveTextTransform'
    | 'RemoveUnusedStyles'
    | 'RenameLayer'
    | 'ReplaceColor'
    | 'ReplaceFonts'
    | 'ReplaceImage'
    | 'ReplaceOverride'
    | 'ReplaceOverrideStyle'
    | 'ReplaceOverrideSymbol'
    | 'ReplaceWithSymbol'
    | 'ReplaceWithSymbolRoot'
    | 'ResetOrigin'
    | 'ResetSharedColor'
    | 'ResetSharedStyle'
    | 'ResetSymbolSize'
    | 'ResizeArtboardToFit'
    | 'RevealInLayerList'
    | 'ReversePath'
    | 'Rotate'
    | 'RotateClockwise'
    | 'RotateCounterclockwise'
    | 'RoundToPixel'
    | 'RoundedRectangleShape'
    | 'RunPluginCommand'
    | 'SaveAsTemplate'
    | 'Scale'
    | 'Scissors'
    | 'Search'
    | 'SelectAll'
    | 'SelectAllArtboards'
    | 'SelectionChanged'
    | 'SendToSymbolsPage'
    | 'Shape'
    | 'ShowBorderOptions'
    | 'ShowColors'
    | 'ShowComponentsPane'
    | 'ShowDocumentFonts'
    | 'ShowFillOptions'
    | 'ShowFonts'
    | 'ShowLayerList'
    | 'ShowReplaceColorSheet'
    | 'Shutdown'
    | 'Sketch.MSAddComponent'
    | 'Sketch.MSChangeComponentKindActionGroup'
    | 'Sketch.MSChangeLayerStyleComponentKind'
    | 'Sketch.MSChangeSwatchComponentKind'
    | 'Sketch.MSChangeSymbolComponentKind'
    | 'Sketch.MSChangeTextStyleComponentKind'
    | 'Sketch.MSComponentsPicker'
    | 'Sketch.MSContentMode'
    | 'Sketch.MSCopyComponent'
    | 'Sketch.MSDeleteComponent'
    | 'Sketch.MSDuplicateComponent'
    | 'Sketch.MSEditSymbolMasterComponent'
    | 'Sketch.MSFilterComponentList'
    | 'Sketch.MSGroupComponents'
    | 'Sketch.MSInsertComponentInstance'
    | 'Sketch.MSMaintainScrollPosition'
    | 'Sketch.MSRenameComponent'
    | 'Sketch.MSRenameSharedStyle'
    | 'Sketch.MSRevealComponent'
    | 'Sketch.MSRevealComponentsPanel'
    | 'Sketch.MSTidy'
    | 'Sketch.MSUngroupComponents'
    | 'Sketch.MSVisitSymbolComponent'
    | 'Sketch.ToggleLibraryListInComponentsPanel'
    | 'SmartRotate'
    | 'StarShape'
    | 'Startup'
    | 'Subtract'
    | 'SyncLibrary'
    | 'SyncLocalColor'
    | 'SyncLocalStyle'
    | 'TextAlignTouchBarGroup'
    | 'TextChanged'
    | 'TextOnPath'
    | 'TextStyleTouchBar'
    | 'ToggleAlignmentGuides'
    | 'ToggleArtboardShadow'
    | 'ToggleBorder'
    | 'ToggleFill'
    | 'ToggleFixToViewport'
    | 'ToggleFlowInteraction'
    | 'ToggleGrid'
    | 'ToggleInspectorVisibility'
    | 'ToggleInterface'
    | 'ToggleLayerHighlight'
    | 'ToggleLayout'
    | 'TogglePixelGrid'
    | 'TogglePixelLines'
    | 'ToggleRulerDragLocking'
    | 'ToggleRulers'
    | 'ToggleSelection'
    | 'ToggleSidebarVisibility'
    | 'ToggleSliceInteraction'
    | 'ToggleToolbarVisibility'
    | 'ToolsMenu'
    | 'Transform'
    | 'TriangleShape'
    | 'Underline'
    | 'Undo'
    | 'Ungroup'
    | 'Union'
    | 'UnlinkAndSyncFromLibrary'
    | 'UnlinkFromLibrary'
    | 'UpdatePlugins'
    | 'ViewDocumentInDocumentsWindow'
    | 'ViewMenu'
    | 'ViewOnSketchCloudWeb'
    | 'Zoom'
    | 'ZoomActions'
    | 'ZoomIn'
    | 'ZoomOut'
    | 'ZoomToActualSize'
    | 'ZoomToArtboard'
    | 'ZoomToSelection';

/** Phase suffix that narrows a handler to one end of a two-phase action. */
export type SketchActionPhase = 'begin' | 'finish';

/**
 * Any key that may appear in `handlers.actions`. Bare names listen to every
 * phase; `.begin`/`.finish` narrow to one end of a two-phase action.
 */
export type SketchActionKey =
    | SketchActionName
    | `${SketchActionName}.${SketchActionPhase}`;

/** Resolve an action key back to its base name. */
export type SketchActionBaseName<K extends SketchActionKey> =
    K extends `${infer Base}.${SketchActionPhase}` ? Base : K;

/** Strongly-typed payload for a given action name. */
export type SketchActionContextFor<Name extends string> =
    Name extends keyof SketchActionContextMap
        ? SketchActionContextMap[Name]
        : unknown;

/**
 * Shape of the single `context` argument passed to an action handler.
 * `actionContext` is the action-specific payload; the other fields come from
 * the general plugin command context and are present in practice even though
 * the Action API guide does not list them explicitly.
 */
export interface SketchHandlerContext<
    Name extends SketchActionName = SketchActionName,
> {
    actionContext: SketchActionContextFor<Name>;
}

/** Function signature for an action handler exported by a command script. */
export type SketchActionHandler<
    Name extends SketchActionName = SketchActionName,
> = (context: SketchHandlerContext<Name>) => void;
