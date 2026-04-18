// Opaque placeholders for Objective-C / Cocoa bridged types that appear on
// Sketch DOM surfaces. Declared globally so they can be referenced from any
// `declare module 'sketch/*'` block without per-module imports. If you want
// real Apple typings, install a peer dep such as `cocoascript-types` or
// `sketch-internal-types` and declaration merging will supersede these.

declare namespace SketchNative {
    interface Opaque<Tag extends string> {
        readonly __sketchNativeTag: Tag;
    }

    // Foundation / CoreGraphics
    type NSObject = Opaque<'NSObject'>;
    type NSString = Opaque<'NSString'>;
    type NSURL = Opaque<'NSURL'>;
    type NSData = Opaque<'NSData'>;
    type NSColor = Opaque<'NSColor'>;
    type NSImage = Opaque<'NSImage'>;
    type NSError = Opaque<'NSError'>;

    interface CGPoint {
        x: number;
        y: number;
    }
    interface CGSize {
        width: number;
        height: number;
    }
    interface CGRect {
        origin: CGPoint;
        size: CGSize;
    }
    type NSPoint = CGPoint;
    type NSSize = CGSize;
    type NSRect = CGRect;

    // Sketch internals (MS*)
    type MSDocument = Opaque<'MSDocument'>;
    type MSImmutableDocumentData = Opaque<'MSImmutableDocumentData'>;
    type MSLayer = Opaque<'MSLayer'>;
    type MSPage = Opaque<'MSPage'>;
    type MSArtboardGroup = Opaque<'MSArtboardGroup'>;
    type MSSymbolMaster = Opaque<'MSSymbolMaster'>;
    type MSSymbolInstance = Opaque<'MSSymbolInstance'>;
    type MSShapeGroup = Opaque<'MSShapeGroup'>;
    type MSTextLayer = Opaque<'MSTextLayer'>;
    type MSSharedStyle = Opaque<'MSSharedStyle'>;
    type MSAssetLibrary = Opaque<'MSAssetLibrary'>;
    type MSExportRequest = Opaque<'MSExportRequest'>;

    // Catch-all for anything this package does not yet name.
    type Any = Opaque<'NativeAny'>;
}
