# Calling Cocoa / Objective-C APIs

Plugins routinely drop into Cocoa for file I/O, image encoding, or URL handling. The package ships typed instance and class interfaces for a small, high-traffic subset of Foundation: `NSString`, `NSURL`, `NSData`, `NSImage`, `NSBitmapImageRep`, `NSFileManager`. Selector names map to JS by replacing each `:` with `_`, matching how CocoaScript bridges them.

`NSClassFromString` is overloaded for these classes, so the returned class object is typed — no `as` cast needed:

```ts
const NSImage = NSClassFromString('NSImage');             // SketchNative.NSImageClass
const NSData = NSClassFromString('NSData');               // SketchNative.NSDataClass
const NSFileManager = NSClassFromString('NSFileManager'); // SketchNative.NSFileManagerClass

const img = NSImage.alloc().initWithContentsOfFile_('/tmp/pic.png');
if (img) log(img.size().width, img.size().height);
```

For anything else, `NSClassFromString` falls back to `unknown` — cast it yourself. If you want exhaustive Apple types, install [`cocoascript-types`](https://www.npmjs.com/package/cocoascript-types) as a peer dev dep and declaration merging will supersede the opaque placeholders this package ships.

See [`examples/cocoa-file-io/`](../examples/cocoa-file-io/) for a working end-to-end example using `NSFileManager`, `NSURL`, `NSString`, and `MOPointer` for error out-params.
