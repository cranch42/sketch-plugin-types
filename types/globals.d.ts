/// <reference path="./native.d.ts" />
/// <reference path="./dom.d.ts" />
/// <reference path="./actions.d.ts" />

// Opt-in ambient globals for the CocoaScript / JavaScriptCore environment a
// Sketch plugin script runs in. Import this file for its side effects from
// one place in your project, e.g. `src/types/globals.d.ts`:
//
//   import 'sketch-plugin-types/globals';
//
// It purposefully does NOT declare Node polyfills (`fs`, `process`, etc.) —
// install `@types/node` if you need those.

import type {
    SketchActionName,
    SketchHandlerContext,
} from './actions';

declare global {
    /**
     * Delivered to every plugin command function. Sketch also attaches it to
     * the global scope of the script, so plugin code can reference it
     * directly. Use the generic form `SketchPluginContext<'Name'>` to narrow
     * `actionContext` when authoring an action handler.
     */
    interface SketchPluginContext<
        Name extends SketchActionName = SketchActionName,
    > extends SketchHandlerContext<Name> {
        /**
         * The native `MSDocument` — NOT the wrapped `sketch/dom` Document.
         * Use `sketch.fromNative(ctx.document)` or, more commonly,
         * `sketch.getSelectedDocument()` to get the JS API wrapper.
         */
        document: SketchNative.MSDocument;
        selection: SketchNative.Opaque<'MSLayerArray'>;
        scriptURL: SketchNative.NSURL;
        scriptPath: string;
        plugin: SketchNative.Opaque<'MSPluginBundle'>;
        command: SketchNative.Opaque<'MSPluginCommand'>;
        api(): typeof import('sketch/dom');
    }

    /** Injected into every command script by Sketch at runtime. */
    const context: SketchPluginContext;

    /** Writes to `~/Library/Logs/com.bohemiancoding.sketch3/Plugin Output.log`. */
    function log(...args: unknown[]): void;
    /** Alias of `log` with `print`-style newline handling. */
    function print(...args: unknown[]): void;

    /** CocoaScript runtime helpers. */
    const coscript: {
        setShouldKeepAround(keepAround: boolean): void;
        shouldKeepAround(): boolean;
        isRunning(): boolean;
        scheduleWithInterval_jsFunction_(
            interval: number,
            fn: () => void,
        ): SketchNative.Opaque<'CoscriptTimer'>;
    };

    /** Loads an additional Apple framework (Foundation/CoreGraphics are preloaded). */
    function framework(frameworkName: string): boolean;

    /**
     * Used to pass `NSError **` out-parameters to Objective-C APIs.
     * Example:
     * ```ts
     * const errPtr = MOPointer.alloc().init();
     * someObjcMethod(errPtr);
     * const err = errPtr.value();
     * ```
     */
    const MOPointer: {
        alloc(): {
            init(): MOPointer<unknown>;
            initWithValue<T>(value: T): MOPointer<T>;
        };
    };
    interface MOPointer<T> {
        value(): T;
    }

    /**
     * CocoaScript-bridged JS-to-Objective-C object wrapper. Rarely used
     * directly; present for completeness.
     */
    const MOJSObject: unknown;

    /**
     * Cocoa reflection. Returns the class object for a given Objective-C
     * class name. Overloaded for the Foundation classes that ship with
     * typed instance / class interfaces under `SketchNative.*`. Anything
     * not listed falls through to the trailing `string` overload and
     * stays `unknown` — cast it yourself when you know the shape.
     */
    function NSClassFromString(name: 'NSImage'): SketchNative.NSImageClass;
    function NSClassFromString(name: 'NSData'): SketchNative.NSDataClass;
    function NSClassFromString(name: 'NSURL'): SketchNative.NSURLClass;
    function NSClassFromString(name: 'NSString'): SketchNative.NSStringClass;
    function NSClassFromString(name: 'NSFileManager'): SketchNative.NSFileManagerClass;
    function NSClassFromString(name: 'NSBitmapImageRep'): SketchNative.NSBitmapImageRepClass;
    function NSClassFromString(name: string): unknown;
}

export {};
