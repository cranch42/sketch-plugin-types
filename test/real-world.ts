// Stress test: snippets adapted verbatim from the Sketch developer docs and
// the `skpm` starter templates, translated to TypeScript. If any of these
// fail to typecheck, the typings are wrong for real-world use.

import 'sketch-plugin-types/globals';

import sketch from 'sketch';
import * as dom from 'sketch/dom';
import * as UI from 'sketch/ui';
import * as Settings from 'sketch/settings';
import * as Async from 'sketch/async';
import * as DataSupplier from 'sketch/data-supplier';

// ---------------------------------------------------------------------
// Docs example #1 — "Your First Plugin" (developer.sketch.com/plugins)
// ---------------------------------------------------------------------

export function helloSketch(): void {
    const doc = sketch.getSelectedDocument();
    if (!doc) return;
    const page = doc.selectedPage;

    const artboard = new dom.Artboard({
        name: 'Hello, World!',
        parent: page,
        frame: new dom.Rectangle(0, 0, 400, 300),
    });

    const text = new dom.Text({
        name: 'Hello',
        text: 'Hello, world!',
        parent: artboard,
        frame: new dom.Rectangle(0, 0, 400, 40),
        alignment: dom.Text.Alignment.center,
    });
    text.adjustToFit();

    UI.message('Done', doc);
}

// ---------------------------------------------------------------------
// Docs example #2 — iterating selection with `.map` + `.filter`
// ---------------------------------------------------------------------

export function onlyRectangles(): dom.Layer[] {
    const doc = sketch.getSelectedDocument();
    if (!doc) return [];
    return doc.selectedLayers
        .filter((l) => l.type === 'ShapePath')
        .map((l) => l as dom.ShapePath)
        .filter((s) => s.shapeType === 'Rectangle');
}

// ---------------------------------------------------------------------
// Docs example #3 — Settings patterns
// ---------------------------------------------------------------------

interface UserPrefs {
    theme: 'light' | 'dark';
    visitCount: number;
}

export function getPrefs(): UserPrefs {
    return (
        Settings.settingForKey<UserPrefs>('prefs') ?? {
            theme: 'light',
            visitCount: 0,
        }
    );
}

export function bumpVisit(): void {
    const prefs = getPrefs();
    prefs.visitCount += 1;
    Settings.setSettingForKey('prefs', prefs);
}

// ---------------------------------------------------------------------
// Docs example #4 — per-layer settings via an Override
// ---------------------------------------------------------------------

export function tagOverride(inst: dom.SymbolInstance, tag: string): void {
    const ov = inst.overrides[0];
    if (!ov) return;
    Settings.setLayerSettingForKey(ov, 'tag', tag);
}

// ---------------------------------------------------------------------
// Docs example #5 — Async/UI.getInputFromUser
// ---------------------------------------------------------------------

export function ask(): void {
    const fiber = Async.createFiber();
    UI.getInputFromUser(
        'Your name?',
        { type: UI.INPUT_TYPE.string, initialValue: 'John' },
        (err, value) => {
            fiber.cleanup();
            if (err) return;
            UI.alert('Hi', String(value));
        },
    );
}

// ---------------------------------------------------------------------
// Docs example #6 — DataSupplier (from skpm/with-datasupplier)
// ---------------------------------------------------------------------

export function onStartup(): void {
    DataSupplier.registerDataSupplier(
        'public.text',
        'Random Emoji',
        'SupplyRandomEmoji',
    );
}
export function onShutdown(): void {
    DataSupplier.deregisterDataSuppliers();
}
export function onSupplyRandomEmoji(
    ctx: SketchPluginContext & { data: { key: string; items: unknown[] } },
): void {
    const emoji = ['😀', '😎', '🤖'];
    const { key, items } = ctx.data;
    DataSupplier.supplyData(
        key,
        items.map(() => emoji[Math.floor(Math.random() * emoji.length)]!),
    );
}

// ---------------------------------------------------------------------
// Docs example #7 — Gradient + pattern fills
// ---------------------------------------------------------------------

export function rainbow(): dom.ShapePath {
    return new dom.ShapePath({
        frame: new dom.Rectangle(0, 0, 100, 100),
        shapeType: 'Rectangle',
        style: {
            fills: [
                {
                    fillType: dom.Style.FillType.Gradient,
                    gradient: {
                        gradientType: 'Linear',
                        from: { x: 0, y: 0 },
                        to: { x: 1, y: 0 },
                        aspectRatio: 0,
                        stops: [
                            { position: 0, color: '#ff0000ff', alpha: 1 },
                            { position: 1, color: '#0000ffff', alpha: 1 },
                        ],
                    },
                },
            ],
        },
    });
}

// ---------------------------------------------------------------------
// Docs example #8 — Shared styles
// ---------------------------------------------------------------------

export function exportSelectionStyle(doc: dom.Document): void {
    const first = doc.selectedLayers.layers[0];
    if (!first || first.type === 'Page') return;

    const shared = dom.SharedStyle.fromStyle({
        name: 'From Plugin',
        style: (first as dom.ShapePath).style,
        document: doc,
    });
    doc.sharedLayerStyles.push(shared);
}

// ---------------------------------------------------------------------
// Docs example #9 — Export + Buffer return
// ---------------------------------------------------------------------

export function getPNG(layer: dom.Layer): Uint8Array | true | object {
    return sketch.export(layer, {
        formats: 'png',
        output: false,
        scales: '2',
    });
}

// ---------------------------------------------------------------------
// Docs example #10 — HandleURL action
// ---------------------------------------------------------------------

export function onHandleURL(ctx: SketchPluginContext<'HandleURL'>): void {
    const { path, query } = ctx.actionContext;
    log(path, query.foo);
}

// ---------------------------------------------------------------------
// Exhaustive enum value access — every enum namespace value reachable
// ---------------------------------------------------------------------

export const enumValues = {
    blend: dom.Style.BlendingMode.PlusLighter,
    blur: dom.Style.BlurType.Glass,
    fill: dom.Style.FillType.Pattern,
    pattern: dom.Style.PatternFillType.Tile,
    borderPos: dom.Style.BorderPosition.Outside,
    arrow: dom.Style.Arrowhead.FilledArrow,
    lineEnd: dom.Style.LineEnd.Projecting,
    lineJoin: dom.Style.LineJoin.Miter, // 'Mitter' at runtime due to upstream typo
    gradient: dom.Style.GradientType.Angular,
    corner: dom.Style.CornerStyle.Smooth,
    shape: dom.ShapePath.ShapeType.Star,
    point: dom.CurvePoint.PointType.Mirrored,
    textAlign: dom.Text.Alignment.justified,
    vAlign: dom.Text.VerticalAlignment.center,
    lineSpacing: dom.Text.LineSpacing.natural,
    mask: dom.Layer.MaskMode.Alpha,
    saveMode: dom.Document.SaveMode.SaveAs,
    colorSpace: dom.Document.ColorSpace.P3,
    sharedStyle: dom.SharedStyle.StyleType.Text,
    library: dom.Library.LibraryType.LocalUser,
    importable: dom.Library.ImportableObjectType.Swatch,
    flex: dom.FlexSizing.Fill,
    pin: dom.Pin.Both,
    group: dom.GroupBehavior.Frame,
    flow: dom.Flow.AnimationType.slideFromRight,
    stackDir: dom.StackLayout.Direction.Column,
    stackJustify: dom.StackLayout.JustifyContent.Between,
    stackAlign: dom.StackLayout.AlignItems.Stretch,
    uiInput: UI.INPUT_TYPE.selection,
} as const;

// ---------------------------------------------------------------------
// Discriminated-union narrowing on `.type`
// ---------------------------------------------------------------------

export function renameByType(layer: dom.Layer): void {
    switch (layer.type) {
        case 'Text':
            (layer as dom.Text).text = `[${(layer as dom.Text).text}]`;
            break;
        case 'ShapePath':
            (layer as dom.ShapePath).closed = true;
            break;
        case 'SymbolInstance':
            (layer as dom.SymbolInstance).detach();
            break;
    }
}

// ---------------------------------------------------------------------
// find() — every selector type
// ---------------------------------------------------------------------

export function findAll(doc: dom.Document): dom.Layer[] {
    return [
        ...dom.find('Artboard', doc),
        ...dom.find('#abc123', doc),
        ...dom.find('ShapePath[name*=button]', doc),
        ...dom.find(':selected', doc),
        ...dom.find('Text[style.fills.color=#ff0000ff]', doc),
        ...dom.find('Group, Frame', doc),
    ];
}
