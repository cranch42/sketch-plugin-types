// Smoke test for typed Cocoa bridge: NSClassFromString overloads,
// instance/class interfaces on the Foundation classes this package ships.

import 'sketch-plugin-types/globals';

// ---------------------------------------------------------------------
// Format constants. These would live in Apple's `NSBitmapImageRep.h`.
// Named here so the call sites read clearly rather than passing magic 0.
// ---------------------------------------------------------------------

/** `NSBitmapImageFileTypeTIFF` — TIFF file format. */
const NSBitmapImageFileTypeTIFF: SketchNative.NSBitmapImageFileType = 0;
/** `NSBitmapImageFileTypePNG` — PNG file format. */
const NSBitmapImageFileTypePNG: SketchNative.NSBitmapImageFileType = 4;

// ---------------------------------------------------------------------
// Load a PNG from disk via NSImage. initWithContentsOfFile_ returns null
// on failure, so narrow before using the result.
// ---------------------------------------------------------------------

export function loadImage(sourcePath: string): SketchNative.NSImageInstance | null {
    const NSImage = NSClassFromString('NSImage');
    const img = NSImage.alloc().initWithContentsOfFile_(sourcePath);
    if (!img) {
        log(`failed to load image at ${sourcePath}`);
        return null;
    }
    const size = img.size();
    log(`loaded image ${size.width}x${size.height}`);
    return img;
}

// ---------------------------------------------------------------------
// Re-encode the image as PNG via NSBitmapImageRep. Two format constants
// live at the top of the file to keep the magic numbers documented.
// ---------------------------------------------------------------------

export function reencodeAsPng(
    img: SketchNative.NSImageInstance,
): SketchNative.NSDataInstance | null {
    const tiff = img.TIFFRepresentation();
    if (!tiff) return null;

    const NSBitmapImageRep = NSClassFromString('NSBitmapImageRep');
    const rep = NSBitmapImageRep.imageRepWithData_(tiff);
    if (!rep) return null;

    // `representationUsingType:properties:` with an empty property dict.
    const _tiffBlob = rep.representationUsingType_properties_(
        NSBitmapImageFileTypeTIFF,
        {},
    );
    return rep.representationUsingType_properties_(
        NSBitmapImageFileTypePNG,
        {},
    );
}

// ---------------------------------------------------------------------
// File manager. `removeItemAtPath:error:` takes an NSError** out-param;
// passing `null` is the "don't care about the error" idiom. Exercising
// the MOPointer branch exists elsewhere in plugin code — here we show
// both paths type-check.
// ---------------------------------------------------------------------

export function ensureAbsent(targetPath: string): boolean {
    const NSFileManager = NSClassFromString('NSFileManager');
    const fm = NSFileManager.defaultManager();

    if (!fm.fileExistsAtPath_(targetPath)) {
        return true;
    }

    const errPtr = MOPointer.alloc().init() as MOPointer<SketchNative.NSError | null>;
    const removed = fm.removeItemAtPath_error_(targetPath, errPtr);
    if (!removed) {
        log('remove failed');
        return false;
    }

    // Second call shows passing `null` when the caller doesn't care.
    return fm.removeItemAtPath_error_(targetPath, null);
}

// ---------------------------------------------------------------------
// NSData + NSURL round-trip: read bytes from disk, wrap a URL, inspect
// its pieces. URLWithString_ returns null for malformed input.
// ---------------------------------------------------------------------

export function describeUrl(urlString: string): string | null {
    const NSURL = NSClassFromString('NSURL');
    const url = NSURL.URLWithString_(urlString);
    if (!url) return null;

    const path: SketchNative.NSStringInstance = url.path();
    const ext: SketchNative.NSStringInstance = url.pathExtension();
    return `${path.UTF8String()} [${ext.UTF8String()}]`;
}

export function readBytes(p: string): number {
    const NSData = NSClassFromString('NSData');
    const data = NSData.dataWithContentsOfFile_(p);
    return data ? data.length() : 0;
}

// ---------------------------------------------------------------------
// alloc + init* pairs — the canonical Obj-C instantiation path. These
// were missing before 0.2.2 even though alloc() already returned a
// typed instance.
// ---------------------------------------------------------------------

/** `NSUTF8StringEncoding`. */
const NSUTF8StringEncoding: SketchNative.NSStringEncoding = 4;

export function decodeUtf8(data: SketchNative.NSDataInstance): string | null {
    const NSString = NSClassFromString('NSString');
    const str = NSString.alloc().initWithData_encoding_(data, NSUTF8StringEncoding);
    return str ? str.UTF8String() : null;
}

export function decodeBase64(b64: string): SketchNative.NSDataInstance | null {
    const NSData = NSClassFromString('NSData');
    return NSData.alloc().initWithBase64EncodedString_options_(b64, 0);
}

export function blankCanvas(width: number, height: number): SketchNative.NSImageInstance {
    const NSImage = NSClassFromString('NSImage');
    return NSImage.alloc().initWithSize_({ width, height });
}

export function allocBitmap(
    width: number,
    height: number,
): SketchNative.NSBitmapImageRepInstance | null {
    const NSBitmapImageRep = NSClassFromString('NSBitmapImageRep');
    return NSBitmapImageRep
        .alloc()
        .initWithBitmapDataPlanes_pixelsWide_pixelsHigh_bitsPerSample_samplesPerPixel_hasAlpha_isPlanar_colorSpaceName_bytesPerRow_bitsPerPixel_(
            null,
            width,
            height,
            8,
            4,
            true,
            false,
            'NSDeviceRGBColorSpace',
            0,
            0,
        );
}

// ---------------------------------------------------------------------
// NSString path building.
// ---------------------------------------------------------------------

export function appendComponent(base: string, child: string): string {
    const NSString = NSClassFromString('NSString');
    const wrapped = NSString.stringWithUTF8String_(base);
    const joined = wrapped.stringByAppendingPathComponent_(child);
    return joined.UTF8String();
}

// ---------------------------------------------------------------------
// Trailing string overload: `NSBezierPath` isn't in the typed set, so
// NSClassFromString returns `unknown`. Demonstrate two safe patterns:
//   1. Cast to a branded `Opaque<'NSBezierPath'>` tag.
//   2. Declare a user-defined interface and cast through `unknown`.
// No `any` escape hatch.
// ---------------------------------------------------------------------

interface NSBezierPathInstance extends SketchNative.Opaque<'NSBezierPath'> {
    moveToPoint_(point: SketchNative.NSPoint): void;
    lineToPoint_(point: SketchNative.NSPoint): void;
    closePath(): void;
}

interface NSBezierPathClass {
    alloc(): NSBezierPathInstance;
    bezierPath(): NSBezierPathInstance;
}

// ---------------------------------------------------------------------
// NSPasteboard — the typical plugin use case is reading whatever the
// user copied and writing something back after a command completes.
// Exercise both the general pasteboard and a named one.
// ---------------------------------------------------------------------

/** `NSPasteboardTypeString` — modern UTI for UTF-8 plain text. */
const NSPasteboardTypeString: SketchNative.NSPasteboardType = 'public.utf8-plain-text';
/** `NSPasteboardTypeHTML` — rich HTML fragment. */
const NSPasteboardTypeHTML: SketchNative.NSPasteboardType = 'public.html';

/** Read the current clipboard text, or null if the user has copied something else. */
export function readClipboardText(): string | null {
    const NSPasteboard = NSClassFromString('NSPasteboard');
    const pb = NSPasteboard.generalPasteboard();
    const str = pb.stringForType_(NSPasteboardTypeString);
    return str ? str.UTF8String() : null;
}

/** Overwrite the clipboard with a plain-text payload. */
export function writeClipboardText(value: string): boolean {
    const NSPasteboard = NSClassFromString('NSPasteboard');
    const pb = NSPasteboard.generalPasteboard();
    pb.clearContents();
    pb.declareTypes_owner_([NSPasteboardTypeString], null);
    return pb.setString_forType_(value, NSPasteboardTypeString);
}

/** Pick the richest payload the clipboard carries right now. */
export function pickBestPayload(): { type: string; value: string } | null {
    const NSPasteboard = NSClassFromString('NSPasteboard');
    const pb = NSPasteboard.generalPasteboard();
    const best = pb.availableTypeFromArray_([
        NSPasteboardTypeHTML,
        NSPasteboardTypeString,
    ]);
    if (!best) return null;
    const str = pb.stringForType_(best);
    if (!str) return null;
    return { type: best, value: str.UTF8String() };
}

/** Watch the pasteboard for external changes without polling the payload. */
export function hasChangedSince(previousCount: number): boolean {
    const NSPasteboard = NSClassFromString('NSPasteboard');
    return NSPasteboard.generalPasteboard().changeCount() !== previousCount;
}

/** Named pasteboard — useful for drag sessions or inter-plugin channels. */
export function writeToNamedChannel(channel: string, value: string): boolean {
    const NSPasteboard = NSClassFromString('NSPasteboard');
    const pb = NSPasteboard.pasteboardWithName_(channel);
    pb.clearContents();
    pb.declareTypes_owner_([NSPasteboardTypeString], null);
    return pb.setString_forType_(value, NSPasteboardTypeString);
}

export function makeTriangle(): NSBezierPathInstance {
    // Pattern 1: opaque branded tag when you don't need methods.
    const raw = NSClassFromString('NSBezierPath');
    const _opaque = raw as SketchNative.Opaque<'NSBezierPath'>;

    // Pattern 2: narrow through a user-defined interface.
    const NSBezierPath = raw as NSBezierPathClass;
    const pathObj = NSBezierPath.bezierPath();
    pathObj.moveToPoint_({ x: 0, y: 0 });
    pathObj.lineToPoint_({ x: 10, y: 0 });
    pathObj.lineToPoint_({ x: 5, y: 10 });
    pathObj.closePath();
    return pathObj;
}
