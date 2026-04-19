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
