// Smoke tests — if this file typechecks, consumers writing plugin code
// against `sketch`, `sketch/dom`, `sketch/ui`, etc. will typecheck too.

import 'sketch-plugin-types/globals';

import sketch from 'sketch';
import * as dom from 'sketch/dom';
import UI from 'sketch/ui';
import * as Settings from 'sketch/settings';
import * as Async from 'sketch/async';
import * as DataSupplier from 'sketch/data-supplier';

import type {
    SketchManifest,
    SketchActionHandler,
    SketchActionName,
    SketchHandlerContext,
} from 'sketch-plugin-types';
import { defineManifest } from 'sketch-plugin-types/manifest';

// ---------------------------------------------------------------------
// Command handler — standard shape Sketch injects `context` into
// ---------------------------------------------------------------------

export function onRun(_ctx: SketchPluginContext): void {
    const doc = sketch.getSelectedDocument();
    if (!doc) return;
    const selection = doc.selectedLayers;

    UI.message(`Selected ${selection.length} layers`, doc);

    // Iterate the selection
    selection.forEach((layer, i) => {
        log(`${i}: ${layer.name} (${layer.type})`);
        layer.name = `${layer.name} [checked]`;
    });
}

// ---------------------------------------------------------------------
// Action handler — narrow context with the generic parameter
// ---------------------------------------------------------------------

export const onSelectionFinished: SketchActionHandler<'SelectionChanged'> = (
    ctx,
) => {
    const { document, oldSelection, newSelection } = ctx.actionContext;
    log(
        `${oldSelection.length} → ${newSelection.length} in ${document.path}`,
    );
};

export const onOpenDocument: SketchActionHandler<'OpenDocument'> = ({
    actionContext,
}) => {
    actionContext.document.showMessage('Opened');
};

export function onExportSlices(
    ctx: SketchHandlerContext<'ExportSlices'>,
): void {
    for (const e of ctx.actionContext.exports) {
        log(`exported → ${e.path}`);
    }
}

// ---------------------------------------------------------------------
// Building a document tree
// ---------------------------------------------------------------------

export function buildPage(doc: dom.Document): dom.Page {
    const page = new dom.Page({ name: 'Generated', parent: doc });
    doc.selectedPage = page;

    const frame = new dom.Group.Frame({
        parent: page,
        name: 'Frame',
        frame: new dom.Rectangle(0, 0, 320, 640),
    });

    const rect = new dom.ShapePath({
        parent: frame,
        shapeType: dom.ShapePath.ShapeType.Rectangle,
        frame: new dom.Rectangle(8, 8, 300, 120),
        style: {
            fills: [
                {
                    color: '#ff0000ff',
                    fillType: dom.Style.FillType.Color,
                },
            ],
        },
    });

    const label = new dom.Text({
        parent: frame,
        frame: new dom.Rectangle(8, 140, 300, 40),
        text: 'Hello, Sketch',
        alignment: dom.Text.Alignment.center,
    });

    label.adjustToFit();

    // Selection has array-like access + iteration
    const selection = page.selectedLayers;
    selection.layers = [rect, label];
    for (const layer of selection) {
        log(layer.name);
    }

    return page;
}

// ---------------------------------------------------------------------
// find() selectors
// ---------------------------------------------------------------------

export function collectRedShapes(doc: dom.Document): dom.Layer[] {
    return dom.find('ShapePath[style.fills.color*=ff0000]', doc);
}

// ---------------------------------------------------------------------
// Settings / Async / DataSupplier
// ---------------------------------------------------------------------

export function persist(key: string, value: unknown): void {
    Settings.setSettingForKey(key, value);
    const readBack = Settings.settingForKey<typeof value>(key);
    log(readBack);
}

export function kickOffAsync(): void {
    const fiber = Async.createFiber();
    fiber.onCleanup(() => log('fiber cleaned up'));
    coscript.scheduleWithInterval_jsFunction_(0.1, () => fiber.cleanup());
}

export function supplyNames(key: string): void {
    DataSupplier.supplyData(key, ['Alice', 'Bob', 'Carol']);
}

// ---------------------------------------------------------------------
// UI input
// ---------------------------------------------------------------------

export function ask(): void {
    UI.getInputFromUser(
        'What is your favourite hex color?',
        {
            type: UI.INPUT_TYPE.string,
            initialValue: '#ff00ff',
        },
        (err, value) => {
            if (err) {
                return;
            }
            UI.message(String(value));
        },
    );
}

// ---------------------------------------------------------------------
// Manifest authored in TS
// ---------------------------------------------------------------------

export const manifest = defineManifest({
    name: 'Example',
    identifier: 'com.example.sketch',
    version: '0.1.0',
    description: 'Smoke-test manifest',
    author: 'me',
    compatibleVersion: '99',
    disableCocoaScriptPreprocessor: true,
    commands: [
        {
            name: 'Run',
            identifier: 'com.example.run',
            script: 'index.js',
            shortcut: 'cmd shift k',
            handlers: {
                run: 'onRun',
                actions: {
                    'SelectionChanged.finish': 'onSelectionFinished',
                    OpenDocument: 'onOpenDocument',
                    ExportSlices: 'onExportSlices',
                },
            },
        },
    ],
    menu: {
        title: 'Example',
        items: ['com.example.run', '-', { title: 'More', items: [] }],
    },
}) satisfies SketchManifest;

// Exercise sketch facade: verify `sketch.export(...)` is callable.
export function exportPage(page: dom.Page): true | Uint8Array | object {
    return sketch.export(page, { formats: 'png' });
}

// Exhaustive-ish ActionName check — narrows via a function.
function handle<N extends SketchActionName>(
    _: N,
    _h: SketchActionHandler<N>,
): void {}
handle('LayersMoved', (c) => c.actionContext.layers.map((l) => l.id));
handle('ArtboardChanged', (c) => c.actionContext.newArtboard?.id);
