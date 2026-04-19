// Opaque placeholders for Objective-C / Cocoa bridged types that appear on
// Sketch DOM surfaces. Declared globally so they can be referenced from any
// `declare module 'sketch/*'` block without per-module imports. If you want
// real Apple typings, install a peer dep such as `cocoascript-types` or
// `sketch-internal-types` and declaration merging will supersede these.
//
// A small, high-value subset of Foundation classes ship with method
// signatures — instance methods on `FooInstance` and class methods on
// `FooClass`. `type Foo = FooInstance` preserves the historical alias so
// existing call sites keep compiling. Everything else stays a pure opaque
// branded tag.

declare namespace SketchNative {
    interface Opaque<Tag extends string> {
        readonly __sketchNativeTag: Tag;
    }

    // ---------------------------------------------------------------------
    // Core geometry
    // ---------------------------------------------------------------------

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

    // ---------------------------------------------------------------------
    // Foundation base
    // ---------------------------------------------------------------------

    type NSObject = Opaque<'NSObject'>;
    type NSColor = Opaque<'NSColor'>;
    type NSError = Opaque<'NSError'>;

    // ---------------------------------------------------------------------
    // NSString
    // ---------------------------------------------------------------------

    /**
     * `NSStringEncoding` constant. Common values:
     *  - `NSUTF8StringEncoding` = 4
     *  - `NSASCIIStringEncoding` = 1
     *  - `NSUTF16StringEncoding` = 10
     *  - `NSISOLatin1StringEncoding` = 5
     */
    type NSStringEncoding = number;

    interface NSStringInstance extends Opaque<'NSString'> {
        initWithUTF8String_(value: string): NSStringInstance | null;
        initWithString_(value: NSStringInstance | string): NSStringInstance | null;
        initWithData_encoding_(
            data: NSDataInstance,
            encoding: NSStringEncoding,
        ): NSStringInstance | null;
        UTF8String(): string;
        length(): number;
        stringByAppendingPathComponent_(component: NSStringInstance | string): NSStringInstance;
        stringByDeletingLastPathComponent(): NSStringInstance;
        isEqualToString_(other: NSStringInstance | string): boolean;
    }
    interface NSStringClass {
        alloc(): NSStringInstance;
        stringWithString_(value: NSStringInstance | string): NSStringInstance;
        stringWithUTF8String_(value: string): NSStringInstance;
    }
    type NSString = NSStringInstance;

    // ---------------------------------------------------------------------
    // NSURL
    // ---------------------------------------------------------------------

    interface NSURLInstance extends Opaque<'NSURL'> {
        initWithString_(str: NSStringInstance | string): NSURLInstance | null;
        initFileURLWithPath_(path: NSStringInstance | string): NSURLInstance;
        absoluteString(): NSStringInstance;
        path(): NSStringInstance;
        scheme(): NSStringInstance | null;
        lastPathComponent(): NSStringInstance;
        pathExtension(): NSStringInstance;
    }
    interface NSURLClass {
        alloc(): NSURLInstance;
        URLWithString_(string: NSStringInstance | string): NSURLInstance | null;
        fileURLWithPath_(path: NSStringInstance | string): NSURLInstance;
    }
    type NSURL = NSURLInstance;

    // ---------------------------------------------------------------------
    // NSData
    // ---------------------------------------------------------------------

    /** Options bitmask for `NSData base64EncodedStringWithOptions:`. */
    type NSDataBase64EncodingOptions = number;

    /** Options bitmask for `NSData initWithBase64EncodedString:options:`. */
    type NSDataBase64DecodingOptions = number;

    interface NSDataInstance extends Opaque<'NSData'> {
        initWithBytes_length_(
            bytes: Opaque<'ConstVoidPointer'>,
            length: number,
        ): NSDataInstance;
        initWithContentsOfURL_(url: NSURLInstance): NSDataInstance | null;
        initWithContentsOfFile_(path: NSStringInstance | string): NSDataInstance | null;
        initWithBase64EncodedString_options_(
            str: NSStringInstance | string,
            options: NSDataBase64DecodingOptions,
        ): NSDataInstance | null;
        length(): number;
        bytes(): Opaque<'ConstVoidPointer'>;
        writeToURL_atomically_(url: NSURLInstance, atomically: boolean): boolean;
        writeToFile_atomically_(path: NSStringInstance | string, atomically: boolean): boolean;
        base64EncodedStringWithOptions_(options: NSDataBase64EncodingOptions): NSStringInstance;
    }
    interface NSDataClass {
        alloc(): NSDataInstance;
        dataWithContentsOfURL_(url: NSURLInstance): NSDataInstance | null;
        dataWithContentsOfFile_(path: NSStringInstance | string): NSDataInstance | null;
        dataWithBytes_length_(bytes: Opaque<'ConstVoidPointer'>, length: number): NSDataInstance;
    }
    type NSData = NSDataInstance;

    // ---------------------------------------------------------------------
    // NSImage
    // ---------------------------------------------------------------------

    /** Option dictionary passed to the `hints:` argument of the draw call. */
    type NSImageHints = Record<string, unknown> | null;

    /** Composite operation constant from `NSCompositingOperation`. */
    type NSCompositingOperation = number;

    interface NSImageInstance extends Opaque<'NSImage'> {
        initWithData_(data: NSDataInstance): NSImageInstance | null;
        initWithContentsOfURL_(url: NSURLInstance): NSImageInstance | null;
        initWithContentsOfFile_(path: NSStringInstance | string): NSImageInstance | null;
        initWithSize_(size: CGSize): NSImageInstance;
        TIFFRepresentation(): NSDataInstance | null;
        size(): CGSize;
        drawInRect_fromRect_operation_fraction_respectFlipped_hints_(
            dstRect: CGRect,
            srcRect: CGRect,
            op: NSCompositingOperation,
            fraction: number,
            respectFlipped: boolean,
            hints: NSImageHints,
        ): void;
        lockFocus(): void;
        unlockFocus(): void;
    }
    interface NSImageClass {
        alloc(): NSImageInstance;
    }
    type NSImage = NSImageInstance;

    // ---------------------------------------------------------------------
    // NSBitmapImageRep
    // ---------------------------------------------------------------------

    /** Bitmap file-format constant from `NSBitmapImageFileType`. */
    type NSBitmapImageFileType = number;

    /** Property dictionary passed to `representationUsingType:properties:`. */
    type NSBitmapImageRepProperties = Record<string, unknown>;

    /**
     * Color-space name string. Common values: `'NSDeviceRGBColorSpace'`,
     * `'NSCalibratedRGBColorSpace'`, `'NSDeviceGrayColorSpace'`.
     */
    type NSColorSpaceName = string;

    interface NSBitmapImageRepInstance extends Opaque<'NSBitmapImageRep'> {
        initWithData_(data: NSDataInstance): NSBitmapImageRepInstance | null;
        /**
         * Designated initializer. Pass `null` as `planes` to let the rep
         * allocate its own pixel buffer — this is the only shape that
         * crosses the CocoaScript bridge cleanly.
         * Set `bytesPerRow` and `bitsPerPixel` to `0` for auto.
         */
        initWithBitmapDataPlanes_pixelsWide_pixelsHigh_bitsPerSample_samplesPerPixel_hasAlpha_isPlanar_colorSpaceName_bytesPerRow_bitsPerPixel_(
            planes: Opaque<'NSBitmapDataPlanes'> | null,
            pixelsWide: number,
            pixelsHigh: number,
            bitsPerSample: number,
            samplesPerPixel: number,
            hasAlpha: boolean,
            isPlanar: boolean,
            colorSpaceName: NSColorSpaceName,
            bytesPerRow: number,
            bitsPerPixel: number,
        ): NSBitmapImageRepInstance | null;
        representationUsingType_properties_(
            type: NSBitmapImageFileType,
            properties: NSBitmapImageRepProperties,
        ): NSDataInstance | null;
        size(): CGSize;
        pixelsWide(): number;
        pixelsHigh(): number;
    }
    interface NSBitmapImageRepClass {
        alloc(): NSBitmapImageRepInstance;
        imageRepWithData_(data: NSDataInstance): NSBitmapImageRepInstance | null;
    }
    type NSBitmapImageRep = NSBitmapImageRepInstance;

    // ---------------------------------------------------------------------
    // NSFileManager
    // ---------------------------------------------------------------------

    /** `NSDictionary` of file attributes. Untyped — consult Apple docs. */
    type NSFileAttributes = Record<string, unknown> | null;

    interface NSFileManagerInstance extends Opaque<'NSFileManager'> {
        fileExistsAtPath_(path: NSStringInstance | string): boolean;
        createDirectoryAtPath_withIntermediateDirectories_attributes_error_(
            path: NSStringInstance | string,
            createIntermediates: boolean,
            attributes: NSFileAttributes,
            error: MOPointer<NSError | null> | null,
        ): boolean;
        removeItemAtPath_error_(
            path: NSStringInstance | string,
            error: MOPointer<NSError | null> | null,
        ): boolean;
        copyItemAtPath_toPath_error_(
            srcPath: NSStringInstance | string,
            dstPath: NSStringInstance | string,
            error: MOPointer<NSError | null> | null,
        ): boolean;
        contentsOfDirectoryAtPath_error_(
            path: NSStringInstance | string,
            error: MOPointer<NSError | null> | null,
        ): Opaque<'NSArray'> | null;
    }
    interface NSFileManagerClass {
        defaultManager(): NSFileManagerInstance;
    }
    type NSFileManager = NSFileManagerInstance;

    // ---------------------------------------------------------------------
    // Sketch internals (MS*) — stay opaque for now.
    // ---------------------------------------------------------------------

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

// `MOPointer<T>` is declared ambient-global in `types/globals.d.ts`. The
// `NSFileManager` signatures above reference it by name without importing
// the globals module, which is safe because both files contribute to the
// same global scope.
declare interface MOPointer<T> {
    value(): T;
}
