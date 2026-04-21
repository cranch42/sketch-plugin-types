/// <reference path="./native.d.ts" />

declare module 'sketch/dom' {
    // ---------------------------------------------------------------------
    // Primitive geometry
    // ---------------------------------------------------------------------

    export class Point {
        constructor(x: number, y: number);
        constructor(point: Point | { x: number; y: number });
        x: number;
        y: number;
        asCGPoint(): SketchNative.CGPoint;
        asNSPoint(): SketchNative.NSPoint;
        toJSON(): { x: number; y: number };
    }

    export class Rectangle {
        constructor(x: number, y: number, width: number, height: number);
        constructor(
            rect:
                | Rectangle
                | { x: number; y: number; width: number; height: number }
                | {
                      origin: { x: number; y: number };
                      size: { width: number; height: number };
                  },
        );
        x: number;
        y: number;
        width: number;
        height: number;
        offset(x: number, y: number): Rectangle;
        scale(factorWidth: number, factorHeight?: number): Rectangle;
        changeBasis(opts: { from?: Layer; to?: Layer }): Rectangle;
        asCGRect(): SketchNative.CGRect;
        asNSRect(): SketchNative.NSRect;
        toString(): string;
        toJSON(): { x: number; y: number; width: number; height: number };
    }

    // ---------------------------------------------------------------------
    // Color / rgba-hex string helper
    // ---------------------------------------------------------------------

    /**
     * RGBA hex color string, e.g. `'#RRGGBBAA'` or `'#RRGGBB'`.
     * Kept as a plain `string` alias for convenience; the Sketch API does not
     * validate the format at the type level.
     */
    export type Color = string;

    // ---------------------------------------------------------------------
    // Sizing / pinning / group behavior (simple enums)
    // ---------------------------------------------------------------------

    export type FlexSizing = 'Fixed' | 'Fit' | 'Fill' | 'Relative';
    export const FlexSizing: {
        readonly Fixed: 'Fixed';
        readonly Fit: 'Fit';
        readonly Fill: 'Fill';
        readonly Relative: 'Relative';
    };

    export type Pin = 'None' | 'Min' | 'Max' | 'Both';
    export const Pin: {
        readonly None: 'None';
        readonly Min: 'Min';
        readonly Max: 'Max';
        readonly Both: 'Both';
    };

    export type GroupBehavior = 'Default' | 'Frame' | 'Graphic';
    export const GroupBehavior: {
        readonly Default: 'Default';
        readonly Frame: 'Frame';
        readonly Graphic: 'Graphic';
    };

    // ---------------------------------------------------------------------
    // Types registry (string union of every `.type` value)
    // ---------------------------------------------------------------------

    export type Types =
        | 'Group'
        | 'Page'
        | 'Artboard'
        | 'Shape'
        | 'Style'
        | 'Blur'
        | 'Border'
        | 'BorderOptions'
        | 'BorderSides'
        | 'Fill'
        | 'Gradient'
        | 'GradientStop'
        | 'Shadow'
        | 'Image'
        | 'Text'
        | 'Document'
        | 'Library'
        | 'StackLayout'
        | 'SymbolMaster'
        | 'SymbolInstance'
        | 'Override'
        | 'ImageData'
        | 'Flow'
        | 'HotSpot'
        | 'ImportableObject'
        | 'SharedStyle'
        | 'DataOverride'
        | 'ShapePath'
        | 'Slice'
        | 'ExportFormat'
        | 'CurvePoint'
        | 'ColorAsset'
        | 'GradientAsset'
        | 'Swatch';
    export const Types: { readonly [K in Types]: K };

    // ---------------------------------------------------------------------
    // Style: interfaces (Fill, Border, Shadow, Blur, Gradient, Corners, FontAxes)
    // ---------------------------------------------------------------------

    export interface Fill {
        fillType: Style.FillType;
        color: Color;
        swatch?: Swatch;
        gradient: Gradient;
        pattern: {
            patternType: Style.PatternFillType;
            image: ImageData | null;
            tileScale: number;
        };
        enabled: boolean;
        blendingMode: Style.BlendingMode;
    }

    export interface Border {
        fillType: Style.FillType;
        color: Color;
        swatch?: Swatch;
        gradient: Gradient;
        enabled: boolean;
        position: Style.BorderPosition;
        thickness: number;
        blendingMode: Style.BlendingMode;
        hasIndividualSides: boolean;
        sides: { left: number; top: number; right: number; bottom: number };
    }

    export interface BorderOptions {
        startArrowhead: Style.Arrowhead;
        endArrowhead: Style.Arrowhead;
        dashPattern: number[];
        lineEnd: Style.LineEnd;
        lineJoin: Style.LineJoin;
    }

    export interface Shadow {
        color: Color;
        swatch?: Swatch;
        blur: number;
        x: number;
        y: number;
        spread: number;
        enabled: boolean;
        isInnerShadow: boolean;
        blendingMode: Style.BlendingMode;
    }

    export interface Blur {
        blurType: Style.BlurType;
        radius: number;
        enabled: boolean;
        motionAngle?: number;
        center?: { x: number; y: number };
        saturation?: number;
        brightness?: number;
        distortion?: number;
        depth?: number;
        chromaticAberration?: number;
        hasSpecularHighlights?: boolean;
        progressive?: boolean;
        gradient?: Gradient;
    }

    export interface GradientStop {
        position: number;
        color: Color;
        swatch?: Swatch;
        alpha: number;
    }

    export interface Gradient {
        gradientType: Style.GradientType;
        from: { x: number; y: number };
        to: { x: number; y: number };
        aspectRatio: number;
        stops: GradientStop[];
    }

    export interface Corners {
        radii: number | number[];
        style: Style.CornerStyle;
        concentric: boolean;
        smoothing: number;
        radiusAt(index: number): number | undefined;
    }

    export interface FontAxes {
        [axisName: string]: {
            id: string;
            min: number;
            max: number;
            value: number;
        };
    }

    // Plain-object input accepted wherever `style` is assigned.
    export interface StyleProps {
        opacity?: number;
        blendingMode?: Style.BlendingMode;
        blurs?: Partial<Blur>[];
        fills?: Partial<Fill>[];
        borders?: Partial<Border>[];
        borderOptions?: Partial<BorderOptions>;
        shadows?: Partial<Shadow>[];
        innerShadows?: Partial<Shadow>[];
        corners?: Partial<Corners>;
        progressiveAlpha?: Partial<Gradient>;
        tint?: Partial<Fill>;
        // Text-specific
        alignment?: Text.Alignment;
        /**
         * @deprecated Sketch ignores `verticalAlignment` at runtime (logs
         * `no idea what to do with "verticalAlignment" in Text`). Center a
         * text layer manually: call `text.adjustToFit()` to get the intrinsic
         * height, then offset `text.frame.y` against the container.
         */
        verticalAlignment?: Text.VerticalAlignment;
        kerning?: number | null;
        lineHeight?: number | null;
        paragraphSpacing?: number;
        textColor?: Color;
        textSwatch?: Swatch;
        fontSize?: number;
        textTransform?: 'none' | 'uppercase' | 'lowercase';
        fontFamily?: string;
        fontWeight?: number;
        fontStyle?: 'italic';
        fontVariant?: 'small-caps';
        fontStretch?:
            | 'compressed'
            | 'condensed'
            | 'narrow'
            | 'expanded'
            | 'poster';
        textUnderline?: string;
        textStrikethrough?: string;
        fontAxes?: FontAxes;
    }

    // ---------------------------------------------------------------------
    // Style class (+ enum namespaces)
    // ---------------------------------------------------------------------

    export class Style implements StyleProps {
        readonly type: 'Style';
        opacity: number;
        blendingMode: Style.BlendingMode;
        blurs: Blur[];
        fills: Fill[];
        borders: Border[];
        borderOptions: BorderOptions;
        shadows: Shadow[];
        innerShadows: Shadow[];
        corners: Corners;
        progressiveAlpha: Gradient | undefined;
        /** Group tint. Undefined on non-Group layers. */
        tint: Fill | undefined;
        readonly styleType: SharedStyle.StyleType;

        // Text-specific
        alignment: Text.Alignment;
        /** @deprecated See `StyleProps.verticalAlignment`. */
        verticalAlignment: Text.VerticalAlignment;
        kerning: number | null;
        lineHeight: number | null;
        paragraphSpacing: number;
        textColor: Color;
        textSwatch: Swatch | undefined;
        fontSize: number;
        textTransform: 'none' | 'uppercase' | 'lowercase';
        fontFamily: string;
        fontWeight: number;
        fontStyle: 'italic' | undefined;
        fontVariant: 'small-caps' | undefined;
        fontStretch:
            | 'compressed'
            | 'condensed'
            | 'narrow'
            | 'expanded'
            | 'poster'
            | undefined;
        textUnderline: string;
        textStrikethrough: string;
        fontAxes: FontAxes;

        getDefaultLineHeight(): number | undefined;
        isOutOfSyncWithSharedStyle(sharedStyle: SharedStyle): boolean;
        syncWithSharedStyle(sharedStyle: SharedStyle): void;

        static colorFromString(color: string): SketchNative.NSColor;
        static colorToString(color: SketchNative.NSColor): string;
    }

    export namespace Style {
        type BlendingMode =
            | 'Normal'
            | 'Darken'
            | 'Multiply'
            | 'ColorBurn'
            | 'Lighten'
            | 'Screen'
            | 'ColorDodge'
            | 'Overlay'
            | 'SoftLight'
            | 'HardLight'
            | 'Difference'
            | 'Exclusion'
            | 'Hue'
            | 'Saturation'
            | 'Color'
            | 'Luminosity'
            | 'PlusDarker'
            | 'PlusLighter';
        const BlendingMode: { readonly [K in BlendingMode]: K };

        type BlurType = 'Gaussian' | 'Motion' | 'Zoom' | 'Background' | 'Glass';
        const BlurType: { readonly [K in BlurType]: K };

        type FillType = 'Color' | 'Gradient' | 'Pattern';
        const FillType: { readonly [K in FillType]: K };

        type PatternFillType = 'Tile' | 'Fill' | 'Stretch' | 'Fit';
        const PatternFillType: { readonly [K in PatternFillType]: K };

        type BorderPosition = 'Center' | 'Inside' | 'Outside' | 'Both';
        const BorderPosition: { readonly [K in BorderPosition]: K };

        type Arrowhead =
            | 'None'
            | 'OpenArrow'
            | 'FilledArrow'
            | 'Line'
            | 'OpenCircle'
            | 'FilledCircle'
            | 'OpenSquare'
            | 'FilledSquare';
        const Arrowhead: { readonly [K in Arrowhead]: K };

        type LineEnd = 'Butt' | 'Round' | 'Projecting';
        const LineEnd: { readonly [K in LineEnd]: K };

        // The enum key is `Miter` but the runtime value is the mis-spelled
        // `'Mitter'`. See https://github.com/sketch-hq/SketchAPI source.
        type LineJoin = 'Mitter' | 'Round' | 'Bevel';
        const LineJoin: {
            readonly Miter: 'Mitter';
            readonly Round: 'Round';
            readonly Bevel: 'Bevel';
        };

        type GradientType = 'Linear' | 'Radial' | 'Angular';
        const GradientType: { readonly [K in GradientType]: K };

        // Integer-valued, but accepts both keys at runtime.
        type CornerStyle = -1 | 0 | 1 | 2 | 3 | 4;
        const CornerStyle: {
            readonly Auto: -1;
            readonly Rounded: 0;
            readonly Smooth: 1;
            readonly Angled: 2;
            readonly InsideSquare: 3;
            readonly InsideArc: 4;
        };
    }

    // ---------------------------------------------------------------------
    // SharedStyle
    // ---------------------------------------------------------------------

    export class SharedStyle {
        readonly type: 'SharedStyle';
        readonly id: string;
        readonly styleType: SharedStyle.StyleType;
        name: string;
        style: Style;

        static fromStyle(props: {
            name: string;
            style: Style | StyleProps;
            document: Document;
        }): SharedStyle;

        getAllInstances(): Style[];
        getAllInstancesLayers(): Layer[];
        getLibrary(): Library | null;
        syncWithLibrary(): boolean;
        unlinkFromLibrary(): boolean;
    }

    export namespace SharedStyle {
        type StyleType = 'Text' | 'Layer' | 'Unknown';
        const StyleType: { readonly [K in StyleType]: K };
    }

    // ---------------------------------------------------------------------
    // Swatch / ColorAsset / GradientAsset
    // ---------------------------------------------------------------------

    export class Swatch {
        readonly type: 'Swatch';
        name: string;
        color: Color;
        readonly referencingColor: SketchNative.NSColor;

        static from(
            value: Swatch | string | SketchNative.NSColor,
        ): Swatch | undefined;
    }

    export interface ColorAsset {
        name: string | null;
        color: Color;
    }

    export interface GradientAsset {
        name: string | null;
        gradient: Gradient;
    }

    // ---------------------------------------------------------------------
    // Flow (prototyping)
    // ---------------------------------------------------------------------

    export interface Flow {
        target: Artboard | 'back';
        targetId: string | 'back';
        animationType: Flow.AnimationType;
        maintainScrollPosition?: boolean;
        isBackAction(): boolean;
        isValidConnection(): boolean;
    }

    export const Flow: {
        readonly BackTarget: 'back';
        from(input: Flow | { target?: Artboard | 'back'; targetId?: string }): Flow;
        AnimationType: { readonly [K in Flow.AnimationType]: K };
    };

    export namespace Flow {
        type AnimationType =
            | 'none'
            | 'slideFromRight'
            | 'slideFromLeft'
            | 'slideFromBottom'
            | 'slideFromTop';
    }

    // ---------------------------------------------------------------------
    // ExportFormat
    // ---------------------------------------------------------------------

    export interface ExportFormat {
        fileFormat: 'jpg' | 'png' | 'tiff' | 'eps' | 'pdf' | 'webp' | 'svg';
        /** Mutually exclusive with `suffix`. */
        prefix?: string;
        /** Mutually exclusive with `prefix`. */
        suffix?: string;
        /** e.g. '1x', '2x', '100w', '300h', '50px'. */
        size: string;
    }

    // ---------------------------------------------------------------------
    // ImageData / Image-data input
    // ---------------------------------------------------------------------

    export type ImageDataInput =
        | string
        | { path: string }
        | { base64: string }
        | SketchNative.NSImage
        | SketchNative.NSURL
        | SketchNative.NSData
        | Uint8Array
        | ImageData;

    /**
     * Wrapper around a native image payload. Produced by `ImageData.from(...)`
     * or by reading `.image` off a layer. There is no public constructor —
     * `new ImageData()` throws at runtime. Use the static factory.
     */
    export class ImageData {
        private constructor();

        readonly type: 'ImageData';
        readonly nsimage: SketchNative.NSImage;
        readonly nsdata: SketchNative.NSData;
        readonly size: { width: number; height: number };
        readonly base64: string;

        static from(value: ImageDataInput): ImageData;
    }

    // ---------------------------------------------------------------------
    // Layer (abstract base) + Transform
    // ---------------------------------------------------------------------

    export interface LayerTransform {
        rotation: number;
        flippedHorizontally: boolean;
        flippedVertically: boolean;
    }

    export interface LayerProps {
        name?: string;
        nameIsFixed?: boolean;
        parent?: Group | Page | Document;
        locked?: boolean;
        hidden?: boolean;
        frame?: Rectangle | { x: number; y: number; width: number; height: number };
        horizontalSizing?: FlexSizing;
        verticalSizing?: FlexSizing;
        horizontalPins?: Pin;
        verticalPins?: Pin;
        selected?: boolean;
        flow?: Flow | { target?: Artboard | 'back'; targetId?: string };
        exportFormats?: ExportFormat[];
        transform?: Partial<LayerTransform>;
        breaksMaskChain?: boolean;
        ignoresStackLayout?: boolean;
        preservesSpaceInStackLayoutWhenHidden?: boolean;
    }

    /** Abstract base class for every Sketch layer wrapper. */
    export abstract class Layer {
        readonly id: string;
        readonly type: Types;
        name: string;
        nameIsFixed: boolean;
        parent: Group | Document | null;
        locked: boolean;
        hidden: boolean;
        frame: Rectangle;
        horizontalSizing: FlexSizing;
        verticalSizing: FlexSizing;
        horizontalPins: Pin;
        verticalPins: Pin;
        selected: boolean;
        flow: Flow | undefined;
        exportFormats: ExportFormat[];
        transform: LayerTransform;
        index: number;
        readonly sketchObject: SketchNative.MSLayer;
        readonly closestMaskingLayer: Layer | null;
        breaksMaskChain: boolean;
        ignoresStackLayout: boolean;
        preservesSpaceInStackLayoutWhenHidden: boolean;

        duplicate(): this;
        remove(): this;
        moveToFront(): this;
        moveForward(): this;
        moveToBack(): this;
        moveBackward(): this;

        getParentPage(): Page | undefined;
        getParentArtboard(): Artboard | undefined;
        getParentSymbolMaster(): SymbolMaster | undefined;
        getParentShape(): Shape | undefined;

        /** @deprecated Prefer `Rectangle.changeBasis`. */
        localRectToPageRect(rect: Rectangle): Rectangle;
        /** @deprecated Prefer `Rectangle.changeBasis`. */
        localRectToParentRect(rect: Rectangle): Rectangle;

        export(
            options?: ExportOptions,
            callback?: (err: SketchNative.NSError | null) => void,
        ): void;
    }

    export namespace Layer {
        type MaskMode = 'Outline' | 'Alpha';
        const MaskMode: { readonly [K in MaskMode]: K };
    }

    /** Mixin interface for layers that expose a `Style`. */
    export interface StyledLayer {
        style: Style | StyleProps;
        sharedStyle: SharedStyle | null;
        sharedStyleId: string | null;
    }

    // ---------------------------------------------------------------------
    // Group (+ Artboard legacy)
    // ---------------------------------------------------------------------

    export interface GroupBackground {
        enabled?: boolean;
        includedInExport?: boolean;
        includedInInstance?: boolean;
        color?: Color;
    }

    export interface GroupProps extends LayerProps {
        layers?: Layer[];
        groupBehavior?: GroupBehavior;
        smartLayout?: SmartLayoutPreset | null;
        stackLayout?: StackLayout | StackLayoutProps | null;
        clipsContents?: boolean;
        background?: GroupBackground;
        style?: Style | StyleProps;
    }

    export class Group extends Layer {
        readonly type: 'Group' | 'Artboard' | 'SymbolMaster' | 'Page';
        constructor(properties?: GroupProps);

        layers: Layer[];
        groupBehavior: GroupBehavior;
        readonly isFrame: boolean;
        readonly isGraphicFrame: boolean;
        clipsContents: boolean;
        smartLayout: SmartLayoutPreset | null;
        stackLayout: StackLayout | null;
        flowStartPoint: boolean;
        background: GroupBackground;

        adjustToFit(): this;

        /**
         * Constructor that presets `groupBehavior` to `'Frame'`. Must be
         * invoked with `new` — calling `Group.Frame({...})` without `new`
         * throws at runtime in modern Sketch.
         */
        static Frame: new (properties?: GroupProps) => Group;
        /**
         * Constructor that presets `groupBehavior` to `'Graphic'`. Must be
         * invoked with `new` — calling `Group.Graphic({...})` without `new`
         * throws at runtime.
         */
        static Graphic: new (properties?: GroupProps) => Group;
    }

    /**
     * Legacy marker for top-level Frames. New code should prefer
     * `Group.Frame({...})`; `Artboard` is kept for compatibility and for the
     * `find('Artboard', ...)` selector.
     */
    export class Artboard extends Group {
        readonly type: 'Artboard';
        constructor(properties?: GroupProps);
        getParentArtboard(): undefined;
    }

    // ---------------------------------------------------------------------
    // Page
    // ---------------------------------------------------------------------

    export interface PageProps {
        name?: string;
        layers?: Layer[];
        parent?: Document;
        selected?: boolean;
    }

    export class Page extends Group {
        readonly type: 'Page';
        constructor(properties?: PageProps);
        parent: Document;
        readonly selectedLayers: Selection;
        readonly canvasLevelFrames: Artboard[];

        static getSymbolsPage(document: Document): Page | undefined;
        static createSymbolsPage(): Page;

        isSymbolsPage(): boolean;
        getParentPage(): undefined;
    }

    // ---------------------------------------------------------------------
    // Shape / ShapePath / CurvePoint
    // ---------------------------------------------------------------------

    export interface ShapeProps extends LayerProps {
        layers?: ShapePath[];
        style?: Style | StyleProps;
        masksSiblings?: boolean;
        maskMode?: Layer.MaskMode;
    }

    export class Shape extends Layer implements StyledLayer {
        readonly type: 'Shape';
        constructor(properties?: ShapeProps);
        layers: ShapePath[];
        style: Style | StyleProps;
        sharedStyle: SharedStyle | null;
        sharedStyleId: string | null;
        masksSiblings: boolean;
        maskMode: Layer.MaskMode;
    }

    export interface ShapePathProps extends LayerProps {
        shapeType?: ShapePath.ShapeType;
        points?: CurvePoint[];
        closed?: boolean;
        style?: Style | StyleProps;
        masksSiblings?: boolean;
        maskMode?: Layer.MaskMode;
    }

    export class ShapePath extends Layer implements StyledLayer {
        readonly type: 'ShapePath';
        constructor(properties?: ShapePathProps);
        readonly shapeType: ShapePath.ShapeType;
        points: CurvePoint[];
        closed: boolean;
        edited: boolean;
        masksSiblings: boolean;
        maskMode: Layer.MaskMode;
        style: Style | StyleProps;
        sharedStyle: SharedStyle | null;
        sharedStyleId: string | null;

        /**
         * Build a `ShapePath` from an SVG path `d` attribute.
         *
         * @remarks
         * The factory normalizes the path: the resulting `ShapePath.frame`
         * matches the bounding box of the drawn path, and every
         * `CurvePoint.point` / `curveFrom` / `curveTo` is stored as a
         * percentage of that frame (range `0`–`1`), not in user-space
         * points. Round-tripping through `getSVGPath()` re-emits the path
         * in absolute coordinates, so two calls to `fromSVGPath` on the
         * round-tripped string give you a shape whose `.points` are
         * identical but whose `.frame` may differ if the original path had
         * leading whitespace or a non-zero origin.
         *
         * Supports the full `MoveTo` / `LineTo` / `CurveTo` / `ArcTo` /
         * `ClosePath` command set (`M/m L/l C/c S/s Q/q T/t A/a Z/z`).
         *
         * ```ts
         * const heart = ShapePath.fromSVGPath(
         *   'M10,30 A20,20 0,0,1 50,30 A20,20 0,0,1 90,30 Q90,60 50,90 Q10,60 10,30 Z',
         * );
         * heart.frame.x = 100;            // absolute in points
         * heart.points[0].point;          // { x: 0, y: 0.33 } — percent of frame
         * ```
         */
        static fromSVGPath(svgPath: string): ShapePath;

        getSVGPath(): string;
    }

    export namespace ShapePath {
        type ShapeType =
            | 'Rectangle'
            | 'Oval'
            | 'Triangle'
            | 'Polygon'
            | 'Star'
            | 'Custom';
        const ShapeType: { readonly [K in ShapeType]: K };

        type PointType = CurvePoint.PointType;
        const PointType: typeof CurvePoint.PointType;
    }

    export interface CurvePoint {
        readonly type: 'CurvePoint';
        point: Point;
        curveFrom: Point;
        curveTo: Point;
        cornerRadius: number;
        pointType: CurvePoint.PointType;
        isSelected(): boolean;
    }

    export namespace CurvePoint {
        type PointType =
            | 'Undefined'
            | 'Straight'
            | 'Mirrored'
            | 'Asymmetric'
            | 'Disconnected';
        const PointType: { readonly [K in PointType]: K };
    }

    // ---------------------------------------------------------------------
    // Image
    // ---------------------------------------------------------------------

    export interface ImageProps extends LayerProps {
        image?: ImageDataInput;
        style?: Style | StyleProps;
    }

    export class Image extends Layer implements StyledLayer {
        readonly type: 'Image';
        constructor(properties?: ImageProps);
        image: ImageData;
        style: Style | StyleProps;
        sharedStyle: SharedStyle | null;
        sharedStyleId: string | null;

        resizeToOriginalSize(): this;
        removeBackground(
            options?: { people?: boolean },
            callback?: (err: SketchNative.NSError | undefined) => void,
        ): void;

        static removeBackgroundFromLayers(
            layers: Image[],
            options?: { people?: boolean },
            callback?: (err: SketchNative.NSError | undefined) => void,
        ): void;
    }

    // ---------------------------------------------------------------------
    // Text
    // ---------------------------------------------------------------------

    export interface TextProps extends LayerProps {
        text?: string;
        alignment?: Text.Alignment;
        /** @deprecated See `StyleProps.verticalAlignment`. */
        verticalAlignment?: Text.VerticalAlignment;
        lineSpacing?: Text.LineSpacing;
        fixedWidth?: boolean;
        style?: Style | StyleProps;
    }

    export class Text extends Layer implements StyledLayer {
        readonly type: 'Text';
        constructor(properties?: TextProps);
        text: string;
        lineSpacing: Text.LineSpacing;
        fixedWidth: boolean;
        style: Style | StyleProps;
        sharedStyle: SharedStyle | null;
        sharedStyleId: string | null;
        readonly fragments: Array<{
            rect: Rectangle;
            baselineOffset: number;
            range: { location: number; length: number };
        }>;

        adjustToFit(): this;

        /** @deprecated Set the font via `style.fontFamily`. */
        font: SketchNative.Opaque<'NSFont'>;
        /** @deprecated Set `style.fontSize` instead. */
        systemFontSize: number;
    }

    export namespace Text {
        type Alignment = 'left' | 'right' | 'center' | 'justified' | 'natural';
        const Alignment: { readonly [K in Alignment]: K };

        type VerticalAlignment = 'top' | 'center' | 'bottom';
        const VerticalAlignment: { readonly [K in VerticalAlignment]: K };

        type LineSpacing =
            | 'variable'
            | 'constantBaseline'
            | 'natural'
            | 'system';
        const LineSpacing: { readonly [K in LineSpacing]: K };
    }

    // ---------------------------------------------------------------------
    // Symbols
    // ---------------------------------------------------------------------

    export interface SymbolMasterProps {
        name?: string;
        frame?: Rectangle | { x: number; y: number; width: number; height: number };
        layers?: Layer[];
        background?: GroupBackground;
        exportFormats?: ExportFormat[];
    }

    export class SymbolMaster extends Group {
        readonly type: 'SymbolMaster';
        constructor(properties?: SymbolMasterProps);
        symbolId: string;
        readonly overrides: Override[];

        static fromFrame(frame: Group): SymbolMaster;
        /** @deprecated Alias of `fromFrame`. */
        static fromArtboard(artboard: Artboard): SymbolMaster;

        toArtboard(): Artboard;
        createNewInstance(): SymbolInstance;
        getAllInstances(): SymbolInstance[];
        getLibrary():
            | Library
            | {
                  type: 'Library';
                  id: string;
                  name: string;
                  enabled: false;
                  valid: false;
              }
            | null;
        syncWithLibrary(): boolean;
        unlinkFromLibrary(): boolean;
        getParentArtboard(): undefined;
    }

    export interface SymbolInstanceProps extends LayerProps {
        symbolId: string;
        style?: Style | StyleProps;
    }

    export class SymbolInstance extends Layer implements StyledLayer {
        readonly type: 'SymbolInstance';
        constructor(properties: SymbolInstanceProps);
        symbolId: string;
        readonly master: SymbolMaster;
        readonly overrides: Override[];
        style: Style | StyleProps;
        sharedStyle: SharedStyle | null;
        sharedStyleId: string | null;

        detach(options?: { recursively?: boolean }): Group | null;
        setOverrideValue(
            override: Override,
            value: string | ImageData | Swatch | Color,
        ): this;
        resizeWithSmartLayout(): this;
        overridesForExpandedLayer(expandedLayer: Layer): Override[];
    }

    export interface Override {
        readonly type: 'Override';
        readonly id: string;
        readonly path: string;
        readonly property:
            | 'stringValue'
            | 'symbolID'
            | 'layerStyle'
            | 'textStyle'
            | 'image'
            | 'flowDestination';
        readonly symbolOverride: boolean;
        readonly colorOverride: boolean;
        value: string | ImageData;
        readonly isDefault: boolean;
        readonly defaultValue: string | ImageData;
        readonly affectedLayer:
            | Text
            | Image
            | SymbolInstance
            | SymbolMaster;
        editable: boolean;
        selected: boolean | undefined;
        readonly defaultSwatchValue: Swatch | undefined;
        getFrame(): Rectangle;
    }

    // ---------------------------------------------------------------------
    // HotSpot / Slice
    // ---------------------------------------------------------------------

    export interface HotSpotProps {
        name?: string;
        parent?: Group;
        frame?: Rectangle | { x: number; y: number; width: number; height: number };
        flow?: Flow | { target?: Artboard | 'back'; targetId?: string };
    }

    export class HotSpot extends Layer {
        readonly type: 'HotSpot';
        constructor(properties?: HotSpotProps);
        static fromLayer(layer: Layer): HotSpot;
    }

    export interface SliceProps {
        name?: string;
        parent?: Group;
        frame?: Rectangle | { x: number; y: number; width: number; height: number };
        exportFormats?: ExportFormat[];
    }

    export class Slice extends Layer {
        readonly type: 'Slice';
        constructor(properties?: SliceProps);
    }

    // ---------------------------------------------------------------------
    // StackLayout / SmartLayout
    // ---------------------------------------------------------------------

    export interface StackLayoutProps {
        direction?: StackLayout.Direction;
        justifyContent?: StackLayout.JustifyContent;
        alignItems?: StackLayout.AlignItems;
        gap?: number;
        padding?:
            | number
            | {
                  top?: number;
                  left?: number;
                  bottom?: number;
                  right?: number;
                  vertical?: number;
                  horizontal?: number;
              };
        wraps?: boolean;
        alignContent?: StackLayout.JustifyContent;
        crossAxisGap?: number;
    }

    export class StackLayout {
        readonly type: 'StackLayout';
        constructor(properties?: StackLayoutProps);
        direction: StackLayout.Direction;
        justifyContent: StackLayout.JustifyContent;
        alignItems: StackLayout.AlignItems;
        gap: number;
        padding:
            | number
            | {
                  top: number;
                  left: number;
                  bottom: number;
                  right: number;
                  vertical: number;
                  horizontal: number;
              };
        wraps: boolean;
        alignContent: StackLayout.JustifyContent;
        crossAxisGap: number;

        apply(): void;
    }

    export namespace StackLayout {
        type Direction = 0 | 1;
        const Direction: { readonly Row: 0; readonly Column: 1 };

        type JustifyContent = 0 | 1 | 2 | 3 | 4 | 5;
        const JustifyContent: {
            readonly Start: 0;
            readonly Center: 1;
            readonly End: 2;
            readonly Between: 3;
            readonly Around: 4;
            readonly Evenly: 5;
        };

        type AlignItems = 0 | 1 | 2 | 3 | 5;
        const AlignItems: {
            readonly Start: 0;
            readonly Center: 1;
            readonly End: 2;
            readonly Stretch: 3;
            readonly None: 5;
        };
    }

    /** Stack-item properties that can be set on a child layer of a stack. */
    export interface StackItemLayerProps {
        flex?: number;
        alignSelf?: StackLayout.AlignItems;
        ignoresStackLayout?: boolean;
        preservesSpaceInStackLayoutWhenHidden?: boolean;
    }

    export interface SmartLayoutPreset {
        axis: 0 | 1;
        layoutAnchor: 0 | 1 | 2;
    }

    export const SmartLayout: {
        readonly LeftToRight: SmartLayoutPreset;
        readonly HorizontallyCenter: SmartLayoutPreset;
        readonly RightToLeft: SmartLayoutPreset;
        readonly TopToBottom: SmartLayoutPreset;
        readonly VerticallyCenter: SmartLayoutPreset;
        readonly BottomToTop: SmartLayoutPreset;
    };

    // ---------------------------------------------------------------------
    // Selection
    // ---------------------------------------------------------------------

    export class Selection implements Iterable<Layer> {
        readonly type: 'Selection';
        layers: Layer[];
        readonly length: number;
        readonly isEmpty: boolean;
        [index: number]: Layer;

        forEach(
            fn: (layer: Layer, index: number, all: Layer[]) => void,
        ): void;
        map<T>(fn: (layer: Layer, index: number, all: Layer[]) => T): T[];
        reduce<T>(fn: (acc: T, layer: Layer) => T, initial: T): T;
        filter(fn: (layer: Layer) => boolean): Layer[];
        clear(): this;

        [Symbol.iterator](): IterableIterator<Layer>;
    }

    // ---------------------------------------------------------------------
    // Library / ImportableObject
    // ---------------------------------------------------------------------

    export class Library {
        readonly type: 'Library';
        readonly id: string;
        readonly name: string;
        readonly valid: boolean;
        enabled: boolean;
        readonly libraryType: Library.LibraryType;
        readonly lastModifiedAt: Date;
        readonly sketchObject: SketchNative.MSAssetLibrary;

        static getLibraries(): Library[];
        static getLibraryForDocumentAtPath(path: string): Library;
        static getRemoteLibraryWithRSS(
            url: string,
            callback: (
                err: SketchNative.NSError | null,
                library?: Library,
            ) => void,
        ): void;

        remove(): void;
        getDocument(): Document;
        getImportableReferencesForDocument(doc: Document): ImportableObject[];
        getImportableSymbolReferencesForDocument(
            doc: Document,
        ): ImportableObject[];
        getImportableLayerStyleReferencesForDocument(
            doc: Document,
        ): ImportableObject[];
        getImportableTextStyleReferencesForDocument(
            doc: Document,
        ): ImportableObject[];
        getImportableSwatchReferencesForDocument(
            doc: Document,
        ): ImportableObject[];
    }

    export namespace Library {
        type LibraryType =
            | 'Internal'
            | 'LocalUser'
            | 'RemoteUser'
            | 'RemoteTeam'
            | 'RemoteThirdParty';
        const LibraryType: { readonly [K in LibraryType]: K };

        type ImportableObjectType =
            | 'Symbol'
            | 'LayerStyle'
            | 'TextStyle'
            | 'Swatch';
        const ImportableObjectType: { readonly [K in ImportableObjectType]: K };
    }

    export interface ImportableObject {
        readonly type: 'ImportableObject';
        readonly id: string;
        readonly name: string;
        readonly objectType: Library.ImportableObjectType;
        readonly library: Library;
        import(): SymbolMaster | SharedStyle | Swatch;
    }

    // ---------------------------------------------------------------------
    // Document
    // ---------------------------------------------------------------------

    export interface DocumentProps {
        colorSpace?: Document.ColorSpace;
    }

    export class Document {
        readonly type: 'Document';
        constructor(properties?: DocumentProps);
        readonly id: string;
        pages: Page[];
        selectedPage: Page;
        readonly selectedLayers: Selection;
        readonly path: string;
        sharedLayerStyles: SharedStyle[];
        sharedTextStyles: SharedStyle[];
        colors: ColorAsset[];
        swatches: Swatch[];
        gradients: GradientAsset[];
        colorSpace: Document.ColorSpace;
        readonly sketchObject: SketchNative.MSDocument;

        static getSelectedDocument(): Document | undefined;
        static getDocuments(): Document[];
        static open(
            path: string,
            callback: (
                err: SketchNative.NSError | null,
                doc?: Document,
            ) => void,
        ): void;
        static open(
            callback: (
                err: SketchNative.NSError | null,
                doc?: Document,
            ) => void,
        ): void;
        static fromNative(native: SketchNative.MSDocument): Document;

        save(): void;
        save(path: string): void;
        save(
            path: string,
            options: {
                saveMode?: Document.SaveMode;
                iKnowThatImOverwritingAFolder?: boolean;
            },
        ): void;
        save(
            path: string | undefined,
            options: {
                saveMode?: Document.SaveMode;
                iKnowThatImOverwritingAFolder?: boolean;
            } | undefined,
            callback: (err: SketchNative.NSError | null) => void,
        ): void;

        close(): void;

        centerOnLayer(layer: Layer): void;
        zoomToFitCanvas(): void;
        changeColorSpace(
            colorSpace: Document.ColorSpace,
            convert?: boolean,
        ): void;

        getLayerWithID(layerId: string): Layer | undefined;
        getLayersNamed(name: string): Layer[];

        getSharedLayerStyleWithID(id: string): SharedStyle | undefined;
        getSharedTextStyleWithID(id: string): SharedStyle | undefined;

        getSymbols(): SymbolMaster[];
        getSymbolMasterWithID(symbolId: string): SymbolMaster | undefined;

        showMessage(text: string): void;
    }

    export namespace Document {
        type SaveMode = 'Save' | 'SaveAs' | 'SaveTo';
        const SaveMode: { readonly [K in SaveMode]: K };

        /** @deprecated `'Unmanaged'` is retained only for legacy documents. */
        type ColorSpace = 'sRGB' | 'P3' | 'Unmanaged';
        const ColorSpace: { readonly [K in ColorSpace]: K };
    }

    // ---------------------------------------------------------------------
    // DataOverride (Data Supplier)
    // ---------------------------------------------------------------------

    export interface DataOverride {
        readonly type: 'DataOverride';
        readonly id: string;
        readonly override: Override;
        readonly symbolInstance: SymbolInstance;
    }

    // ---------------------------------------------------------------------
    // find() selector
    // ---------------------------------------------------------------------

    export type FindScope = Document | Page | Layer | SketchNative.NSObject;

    export function find(
        selector: string,
        scope?: FindScope,
        options?: { inclusive?: boolean },
    ): Layer[];

    // ---------------------------------------------------------------------
    // export()
    // ---------------------------------------------------------------------

    export interface ExportOptions {
        formats?: string;
        output?: string | false;
        overwriting?: boolean;
        trimmed?: boolean;
        scales?: string;
        'use-id-for-name'?: boolean;
        compact?: boolean;
        'include-namespaces'?: boolean;
        'save-for-web'?: boolean;
        compression?: number;
        progressive?: boolean;
        'group-contents-only'?: boolean;
        exportFormats?: ExportFormat[];
    }

    export type Exportable = Layer | Page | Document;
    export type ExportResult = true | Uint8Array | Uint8Array[] | object | object[];

    export function exportObject(
        object: Exportable | Exportable[],
        options?: ExportOptions,
    ): ExportResult;

    // Sketch's docs call this top-level function `export` rather than
    // `exportObject`. `export` is a reserved word, so plain consumers go
    // through the `sketch` facade module which exposes `.export()` as a
    // property. Here we only surface the underlying name.

    // ---------------------------------------------------------------------
    // Document/layer factory helpers
    // ---------------------------------------------------------------------

    export function fromNative<T extends Layer | Document | Style | Swatch>(
        native: SketchNative.NSObject,
    ): T;

    export function fromSketchJSON(json: string, version?: number): unknown;

    export function createLayerFromData(
        data: SketchNative.NSData | string,
        type: 'svg' | 'image' | 'layer',
    ): Layer;

    export function getSelectedDocument(): Document | undefined;
    export function getDocuments(): Document[];
    export function getLibraries(): Library[];

    export function getGlobalColors(): ColorAsset[];
    export function getGlobalGradients(): GradientAsset[];
    export const globalAssets: {
        colors: ColorAsset[];
        gradients: GradientAsset[];
    };

    export const version: {
        readonly sketch: string;
        readonly api: string;
    };
}
