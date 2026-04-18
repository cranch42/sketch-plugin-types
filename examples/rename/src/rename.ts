// Batch-renames the current selection with a template.
// Demonstrates:
//   - iterating Selection
//   - UI.getInputFromUser with type: 'string'
//   - simple template substitution ({i}, {name}, {type})
import sketch from 'sketch';
import * as UI from 'sketch/ui';

export function onRun(_ctx: SketchPluginContext): void {
    const doc = sketch.getSelectedDocument();
    if (!doc) {
        UI.alert('Rename Example', 'Open a document first.');
        return;
    }

    const selection = doc.selectedLayers;
    if (selection.isEmpty) {
        UI.alert('Rename Example', 'Select one or more layers first.');
        return;
    }

    UI.getInputFromUser(
        `Rename ${selection.length} layer(s). Use {i}, {name}, {type} as placeholders.`,
        {
            type: UI.INPUT_TYPE.string,
            initialValue: 'Layer {i}',
        },
        (err, value) => {
            if (err) return;
            const template = String(value);

            selection.forEach((layer, i) => {
                layer.name = template
                    .replace(/\{i\}/g, String(i + 1))
                    .replace(/\{name\}/g, layer.name)
                    .replace(/\{type\}/g, layer.type);
            });

            UI.message(`Renamed ${selection.length} layer(s)`, doc);
        },
    );
}
