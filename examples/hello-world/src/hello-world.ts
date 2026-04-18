// Inserts a frame with centered "Hello, World!" text on the current page.
// Demonstrates:
//   - sketch.getSelectedDocument()
//   - new Group.Frame(...) to create a frame
//   - new Text(...) with centered alignment
//   - UI.message() for a status toast
import sketch from 'sketch';
import * as dom from 'sketch/dom';
import * as UI from 'sketch/ui';

export function onRun(_ctx: SketchPluginContext): void {
    const doc = sketch.getSelectedDocument();
    if (!doc) {
        UI.alert('Hello World', 'No document is open.');
        return;
    }

    const page = doc.selectedPage;

    const frame = new dom.Group.Frame({
        parent: page,
        name: 'Hello World',
        frame: new dom.Rectangle(0, 0, 320, 120),
    });

    new dom.ShapePath({
        parent: frame,
        shapeType: dom.ShapePath.ShapeType.Rectangle,
        frame: new dom.Rectangle(0, 0, 320, 120),
        style: {
            fills: [
                {
                    fillType: dom.Style.FillType.Color,
                    color: '#4f46e5ff',
                },
            ],
        },
    });

    const label = new dom.Text({
        parent: frame,
        text: 'Hello, World!',
        style: {
            textColor: '#ffffffff',
            fontSize: 24,
            alignment: dom.Text.Alignment.center,
        },
    });
    label.fixedWidth = true;
    label.frame.width = 320;
    label.adjustToFit();
    const textHeight = label.frame.height;
    label.frame.x = 0;
    label.frame.y = Math.round((120 - textHeight) / 2);

    UI.message(`Inserted "Hello, World!" on "${page.name}"`, doc);
}
