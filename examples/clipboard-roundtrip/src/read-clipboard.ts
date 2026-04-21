// Reads whatever the user last copied and surfaces it in a UI.alert.
// Demonstrates:
//   - NSClassFromString('NSPasteboard') typed overload
//   - NSPasteboard.generalPasteboard()
//   - availableTypeFromArray_ to pick the richest payload the clipboard
//     carries (HTML preferred over plain text)
//   - stringForType_ returning null when the type is absent
//   - changeCount() as a cheap way to surface external edits in the UI
import * as UI from 'sketch/ui';

/** `NSPasteboardTypeString` — UTF-8 plain text. */
const NSPasteboardTypeString: SketchNative.NSPasteboardType = 'public.utf8-plain-text';
/** `NSPasteboardTypeHTML` — rich HTML fragment. */
const NSPasteboardTypeHTML: SketchNative.NSPasteboardType = 'public.html';

export function onRun(_ctx: SketchPluginContext): void {
    const NSPasteboard = NSClassFromString('NSPasteboard');
    const pb = NSPasteboard.generalPasteboard();

    const best = pb.availableTypeFromArray_([
        NSPasteboardTypeHTML,
        NSPasteboardTypeString,
    ]);
    if (!best) {
        UI.alert('Clipboard Roundtrip', 'Clipboard has no text or HTML.');
        return;
    }

    const payload = pb.stringForType_(best);
    const text = payload ? payload.UTF8String() : '';
    const preview = text.length > 500 ? text.slice(0, 500) + '…' : text;

    UI.alert(
        'Clipboard Roundtrip',
        `type: ${best}\nchange #${pb.changeCount()}\n\n${preview}`,
    );
}
