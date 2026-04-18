// Builds a 4x3 grid of rectangles inside a Frame, each with a different hue.
// Demonstrates:
//   - math with dom.Rectangle
//   - putting many layers inside a parent Frame
//   - computing colors and building a typed Fill array
import sketch from 'sketch';
import * as dom from 'sketch/dom';
import * as UI from 'sketch/ui';

const COLS = 4;
const ROWS = 3;
const CELL = 80;
const GAP = 12;

function hue(i: number): string {
    // Cycle through 12 evenly-spaced hues, return a full-opacity hex color.
    const h = (i * 30) % 360;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const a = 0.5 * Math.min(1, Math.max(-1, Math.min(k - 3, 9 - k)));
        const v = 0.5 - a;
        return Math.round(255 * v)
            .toString(16)
            .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}ff`;
}

export function onRun(_ctx: SketchPluginContext): void {
    const doc = sketch.getSelectedDocument();
    if (!doc) {
        UI.alert('Grid Example', 'Open a document first.');
        return;
    }

    const width = COLS * CELL + (COLS - 1) * GAP;
    const height = ROWS * CELL + (ROWS - 1) * GAP;

    const frame = new dom.Group.Frame({
        parent: doc.selectedPage,
        name: 'Color Grid',
        frame: new dom.Rectangle(320, 32, width, height),
    });

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const x = col * (CELL + GAP);
            const y = row * (CELL + GAP);
            new dom.ShapePath({
                parent: frame,
                name: `cell ${row},${col}`,
                shapeType: 'Rectangle',
                frame: new dom.Rectangle(x, y, CELL, CELL),
                style: {
                    fills: [
                        {
                            fillType: 'Color',
                            color: hue(row * COLS + col),
                        },
                    ],
                    borders: [],
                },
            });
        }
    }

    UI.message(`Built ${ROWS * COLS} swatches`, doc);
}
