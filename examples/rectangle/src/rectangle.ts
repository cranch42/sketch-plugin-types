// Creates a blue rectangle at the top-left of the current page.
// Demonstrates:
//   - sketch.getSelectedDocument()
//   - new dom.ShapePath(...) with a solid fill
//   - UI.message() for a status toast
import sketch from 'sketch';
import * as dom from 'sketch/dom';
import * as UI from 'sketch/ui';

export function onRun(_ctx: SketchPluginContext): void {
    const doc = sketch.getSelectedDocument();
    if (!doc) {
        UI.alert('Rectangle Example', 'Open a document first.');
        return;
    }

    const rect = new dom.ShapePath({
        parent: doc.selectedPage,
        name: 'Blue Rectangle',
        shapeType: dom.ShapePath.ShapeType.Rectangle,
        frame: new dom.Rectangle(32, 32, 240, 120),
        style: {
            fills: [
                {
                    fillType: dom.Style.FillType.Color,
                    color: '#4f46e5ff',
                },
            ],
            borders: [],
        },
    });

    doc.selectedLayers.layers = [rect];
    UI.message(`Added "${rect.name}"`, doc);
}
