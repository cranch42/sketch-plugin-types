// Asks the user which shape to insert via a dropdown and creates one.
// Demonstrates:
//   - UI.getInputFromUser with type: 'selection'
//   - async callback style
//   - every value of dom.ShapePath.ShapeType
import sketch from 'sketch';
import * as dom from 'sketch/dom';
import * as UI from 'sketch/ui';

const SHAPES: dom.ShapePath.ShapeType[] = [
    'Rectangle',
    'Oval',
    'Triangle',
    'Polygon',
    'Star',
];

export function onRun(_ctx: SketchPluginContext): void {
    const doc = sketch.getSelectedDocument();
    if (!doc) {
        UI.alert('Shape Picker', 'Open a document first.');
        return;
    }

    UI.getInputFromUser(
        'Pick a shape',
        {
            type: UI.INPUT_TYPE.selection,
            possibleValues: SHAPES,
            initialValue: 'Oval',
        },
        (err, value) => {
            if (err) return;

            const shape = new dom.ShapePath({
                parent: doc.selectedPage,
                name: String(value),
                shapeType: value as dom.ShapePath.ShapeType,
                frame: new dom.Rectangle(600, 32, 160, 160),
                style: {
                    fills: [
                        { fillType: 'Color', color: '#10b981ff' },
                    ],
                    borders: [
                        {
                            fillType: 'Color',
                            color: '#065f46ff',
                            thickness: 2,
                            position: 'Inside',
                        },
                    ],
                },
            });

            doc.selectedLayers.layers = [shape];
            UI.message(`Inserted ${value}`, doc);
        },
    );
}
