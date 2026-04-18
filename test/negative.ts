// Negative tests — the lines under `@ts-expect-error` MUST fail to compile.
// If any of them starts compiling, the typings have grown too lax.

import 'sketch-plugin-types/globals';
import * as dom from 'sketch/dom';
import * as UI from 'sketch/ui';
import type {
    SketchActionHandler,
    SketchManifest,
} from 'sketch-plugin-types';

// Wrong enum literal
// @ts-expect-error 'wrongValue' isn't a valid BlendingMode
const _bad1: dom.Style.BlendingMode = 'wrongValue';

// Wrong shape on Rectangle constructor
// @ts-expect-error first arg must be a number or a Rectangle-shaped object
const _bad2 = new dom.Rectangle('0', 0, 100, 100);

// Wrong property on LayerProps
// @ts-expect-error `lockedd` is a typo
const _bad3 = new dom.Group({ lockedd: true });

// Wrong callback value on UI.getInputFromUser
UI.getInputFromUser(
    'x',
    { type: 'string' },
    // @ts-expect-error value is string | number | undefined, not boolean
    (_err, value: boolean) => value,
);

// Handler typed for ArtboardChanged cannot read a field that only exists on
// SelectionChanged.
const _bad4: SketchActionHandler<'ArtboardChanged'> = (ctx) => {
    // @ts-expect-error no `newSelection` on ArtboardChanged payload
    ctx.actionContext.newSelection;
};

// ActionName union shouldn't accept a made-up name
const _manifest: SketchManifest = {
    name: 'x',
    identifier: 'x',
    version: '1.0',
    description: 'x',
    author: 'x',
    commands: [
        {
            name: 'cmd',
            identifier: 'x.cmd',
            script: 's.js',
            handlers: {
                actions: {
                    // @ts-expect-error NotARealAction is not in SketchActionName
                    NotARealAction: 'doX',
                },
            },
        },
    ],
};
void _manifest;

// SaveMode is a string union, not any string
// @ts-expect-error 'MaybeSave' is not a SaveMode
const _bad5: dom.Document.SaveMode = 'MaybeSave';

// find() scope must be a DOM object, not a random string
// @ts-expect-error wrong scope type
dom.find('Artboard', 'not a document');

// Selection is iterable but individual items are Layer, not string
const _sel = null as unknown as dom.Selection;
for (const layer of _sel) {
    // @ts-expect-error layer.name is a string, not a number
    const n: number = layer.name;
    void n;
}

void _bad1;
void _bad2;
void _bad3;
void _bad4;
void _bad5;
