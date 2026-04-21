// Concatenates the names of the currently selected layers and writes the
// string to the system pasteboard. Demonstrates the write side of the
// NSPasteboard bridge:
//   - clearContents() to drop previous payloads
//   - declareTypes_owner_ accepting a JS array (auto-bridged to NSArray)
//   - setString_forType_ returning false on failure
import sketch from 'sketch';
import * as UI from 'sketch/ui';

const NSPasteboardTypeString: SketchNative.NSPasteboardType = 'public.utf8-plain-text';

export function onRun(_ctx: SketchPluginContext): void {
    const doc = sketch.getSelectedDocument();
    if (!doc) {
        UI.alert('Clipboard Roundtrip', 'No document is open.');
        return;
    }

    const names = doc.selectedLayers.layers.map((layer) => layer.name);
    if (names.length === 0) {
        UI.alert('Clipboard Roundtrip', 'Select at least one layer first.');
        return;
    }

    const joined = names.join('\n');

    const NSPasteboard = NSClassFromString('NSPasteboard');
    const pb = NSPasteboard.generalPasteboard();
    pb.clearContents();
    pb.declareTypes_owner_([NSPasteboardTypeString], null);
    const ok = pb.setString_forType_(joined, NSPasteboardTypeString);

    if (!ok) {
        UI.alert('Clipboard Roundtrip', 'setString:forType: returned NO.');
        return;
    }

    UI.message(`Copied ${names.length} name(s)`, doc);
}
