// Exports the first selected layer as a PNG to ~/Desktop/sketch-capture-<ts>/.
// Demonstrates the typed Cocoa bridge shipped with `sketch-plugin-types`:
//   - NSClassFromString('NSString').stringWithUTF8String_(...)
//   - NSString#stringByAppendingPathComponent_ / UTF8String
//   - NSClassFromString('NSURL').fileURLWithPath_(...)
//   - NSClassFromString('NSFileManager').defaultManager()
//       .fileExistsAtPath_(...)
//       .createDirectoryAtPath_withIntermediateDirectories_attributes_error_(...)
//   - MOPointer.alloc().init() for the NSError out-parameter
//   - sketch.export(layer, { formats: 'png', output: <dir> }) to write the file
import sketch from 'sketch';
import * as UI from 'sketch/ui';

// `NSHomeDirectory` is a free Foundation function — not part of the typed
// Cocoa surface, so we declare it locally and cast the result through the
// typed NSString bridge below.
declare function NSHomeDirectory(): SketchNative.NSString;

export function onRun(_ctx: SketchPluginContext): void {
    const doc = sketch.getSelectedDocument();
    if (!doc) {
        UI.alert('Cocoa File I/O', 'No document is open.');
        return;
    }

    const layer = doc.selectedLayers.layers[0];
    if (!layer) {
        UI.alert('Cocoa File I/O', 'Select a layer first.');
        return;
    }

    // Build the output directory path through the typed NSString helpers.
    const NSString = NSClassFromString('NSString');
    const timestamp = String(Date.now());
    const dirName = NSString.stringWithUTF8String_(
        'sketch-capture-' + timestamp,
    );
    const home = NSHomeDirectory();
    const desktop = home.stringByAppendingPathComponent_('Desktop');
    const outputDir = desktop.stringByAppendingPathComponent_(dirName);
    const outputPath = outputDir.UTF8String();

    // Ensure the directory exists. NSFileManager reports failure via
    // NSError**, which we thread through an MOPointer out-parameter.
    const fm = NSClassFromString('NSFileManager').defaultManager();
    if (!fm.fileExistsAtPath_(outputDir)) {
        const errPtr = MOPointer.alloc().initWithValue<SketchNative.NSError | null>(null);
        const ok = fm.createDirectoryAtPath_withIntermediateDirectories_attributes_error_(
            outputDir,
            true,
            null,
            errPtr,
        );
        if (!ok) {
            UI.alert('Cocoa File I/O', 'Could not create ' + outputPath);
            return;
        }
    }

    // Exercise the typed NSURL overload of NSClassFromString as well.
    const fileURL = NSClassFromString('NSURL').fileURLWithPath_(outputDir);
    log('Exporting to ' + fileURL.absoluteString().UTF8String());

    sketch.export(layer, {
        formats: 'png',
        output: outputPath,
        scales: '2',
        overwriting: true,
    });

    UI.message('Exported -> ' + outputPath, doc);
}
