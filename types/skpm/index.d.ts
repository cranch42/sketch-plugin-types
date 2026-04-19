// Ambient declarations for the Node-like polyfills that `@skpm/builder`
// injects into a Sketch plugin bundle. These modules have no `sketch/`
// prefix and are resolved at build time against the polyfill packages
// shipped in `@skpm/builder/core-modules`.
//
// Side-effect import:
//   import 'sketch-plugin-types/skpm';
//
// Covered: buffer, path, crypto (subset), stream (stubs), util, events,
// url, assert.
// NOT covered: fs. skpm intentionally does not polyfill fs; plugins must
// reach for `NSFileManager` via Cocoa.

// ---------------------------------------------------------------------
// buffer
// Concrete implementation is feross/buffer. Only the surface plugin
// authors actually reach for is declared here.
// ---------------------------------------------------------------------

declare module 'buffer' {
    export type BufferEncoding =
        | 'ascii'
        | 'utf8'
        | 'utf-8'
        | 'utf16le'
        | 'ucs2'
        | 'ucs-2'
        | 'base64'
        | 'base64url'
        | 'latin1'
        | 'binary'
        | 'hex';

    // NOTE: not declared as `extends Uint8Array` because newer lib.d.ts
    // versions parameterise Uint8Array on its underlying ArrayBuffer, and
    // `slice()` returns a narrowed `Buffer` rather than a Uint8Array —
    // which breaks variance. The shape still exposes the indexed access,
    // iteration, and byte-view surface plugin code relies on.
    export interface Buffer extends Iterable<number> {
        readonly length: number;
        readonly byteLength: number;
        readonly byteOffset: number;
        readonly buffer: ArrayBufferLike;
        [index: number]: number;

        write(
            string: string,
            offset?: number,
            length?: number,
            encoding?: BufferEncoding,
        ): number;
        toString(encoding?: BufferEncoding, start?: number, end?: number): string;
        toJSON(): { type: 'Buffer'; data: number[] };
        equals(other: Uint8Array | Buffer): boolean;
        compare(
            target: Uint8Array | Buffer,
            targetStart?: number,
            targetEnd?: number,
            sourceStart?: number,
            sourceEnd?: number,
        ): -1 | 0 | 1;
        copy(
            target: Uint8Array | Buffer,
            targetStart?: number,
            sourceStart?: number,
            sourceEnd?: number,
        ): number;
        slice(start?: number, end?: number): Buffer;
        subarray(start?: number, end?: number): Buffer;
        indexOf(
            value: string | number | Uint8Array | Buffer,
            byteOffset?: number,
            encoding?: BufferEncoding,
        ): number;
        includes(
            value: string | number | Uint8Array | Buffer,
            byteOffset?: number,
            encoding?: BufferEncoding,
        ): boolean;
        fill(
            value: string | number | Uint8Array | Buffer,
            offset?: number,
            end?: number,
            encoding?: BufferEncoding,
        ): this;
    }

    export interface BufferConstructor {
        new (size: number): Buffer;
        new (array: ArrayLike<number> | ArrayBufferLike): Buffer;
        new (str: string, encoding?: BufferEncoding): Buffer;

        from(
            data: ArrayBuffer | SharedArrayBuffer,
            byteOffset?: number,
            length?: number,
        ): Buffer;
        from(data: ArrayLike<number> | Iterable<number>): Buffer;
        from(data: Buffer | Uint8Array): Buffer;
        from(str: string, encoding?: BufferEncoding): Buffer;

        alloc(size: number, fill?: string | number | Uint8Array, encoding?: BufferEncoding): Buffer;
        allocUnsafe(size: number): Buffer;
        allocUnsafeSlow(size: number): Buffer;

        concat(list: ReadonlyArray<Uint8Array | Buffer>, totalLength?: number): Buffer;

        isBuffer(obj: unknown): obj is Buffer;
        isEncoding(encoding: string): encoding is BufferEncoding;
        byteLength(
            string: string | Uint8Array | ArrayBufferLike,
            encoding?: BufferEncoding,
        ): number;
        compare(a: Uint8Array | Buffer, b: Uint8Array | Buffer): -1 | 0 | 1;

        poolSize: number;
    }

    export const Buffer: BufferConstructor;
    export const INSPECT_MAX_BYTES: number;
    export const kMaxLength: number;
    export function transcode(
        source: Uint8Array,
        fromEnc: BufferEncoding,
        toEnc: BufferEncoding,
    ): Buffer;
}

// The Buffer global is also exposed by feross/buffer when the polyfill is
// bundled as a global. These declarations live outside any module block
// so they augment the script-global scope for side-effect imports.
declare const Buffer: import('buffer').BufferConstructor;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Buffer = import('buffer').Buffer;

// ---------------------------------------------------------------------
// path
// POSIX-style path ops. The Windows variants are not declared because
// skpm only runs on macOS.
// ---------------------------------------------------------------------

declare module 'path' {
    export interface ParsedPath {
        root: string;
        dir: string;
        base: string;
        ext: string;
        name: string;
    }

    export function join(...paths: string[]): string;
    export function resolve(...paths: string[]): string;
    export function normalize(p: string): string;
    export function isAbsolute(p: string): boolean;
    export function relative(from: string, to: string): string;
    export function dirname(p: string): string;
    export function basename(p: string, ext?: string): string;
    export function extname(p: string): string;
    export function parse(p: string): ParsedPath;
    export function format(pathObject: Partial<ParsedPath>): string;

    export const sep: '/';
    export const delimiter: ':';

    export interface PathModule {
        join(...paths: string[]): string;
        resolve(...paths: string[]): string;
        normalize(p: string): string;
        isAbsolute(p: string): boolean;
        relative(from: string, to: string): string;
        dirname(p: string): string;
        basename(p: string, ext?: string): string;
        extname(p: string): string;
        parse(p: string): ParsedPath;
        format(pathObject: Partial<ParsedPath>): string;
        sep: string;
        delimiter: string;
    }

    export const posix: PathModule;
    export const win32: PathModule;
}

// ---------------------------------------------------------------------
// crypto
// Only the hashing and random-bytes subset is polyfilled by skpm.
// Streaming APIs, ciphers, HMAC, KDFs, etc. are not provided.
// ---------------------------------------------------------------------

declare module 'crypto' {
    import { Buffer, BufferEncoding } from 'buffer';

    export type BinaryLike = string | ArrayBufferView;
    export type HashEncoding = 'hex' | 'base64' | 'base64url' | 'binary' | 'latin1';

    export interface Hash {
        update(data: BinaryLike, inputEncoding?: BufferEncoding): Hash;
        digest(): Buffer;
        digest(encoding: HashEncoding): string;
    }

    export function createHash(algorithm: string): Hash;
    export function randomBytes(size: number): Buffer;
    export function randomBytes(
        size: number,
        callback: (err: Error | null, buf: Buffer) => void,
    ): void;
    export function randomFillSync<T extends ArrayBufferView>(
        buffer: T,
        offset?: number,
        size?: number,
    ): T;
    export function getHashes(): string[];
}

// ---------------------------------------------------------------------
// stream
// Shape stubs only — just enough for third-party libs that reference
// the stream classes to type-check. No functional typing.
// ---------------------------------------------------------------------

declare module 'stream' {
    import { EventEmitter } from 'events';

    export class Stream extends EventEmitter {
        pipe<T extends Writable>(destination: T, options?: { end?: boolean }): T;
    }

    export interface ReadableOptions {
        highWaterMark?: number;
        encoding?: string;
        objectMode?: boolean;
        read?(this: Readable, size: number): void;
    }

    export class Readable extends Stream {
        constructor(opts?: ReadableOptions);
        readable: boolean;
        read(size?: number): unknown;
        setEncoding(encoding: string): this;
        pause(): this;
        resume(): this;
        isPaused(): boolean;
        unpipe(destination?: Writable): this;
        push(chunk: unknown, encoding?: string): boolean;
        destroy(error?: Error): this;
    }

    export interface WritableOptions {
        highWaterMark?: number;
        decodeStrings?: boolean;
        objectMode?: boolean;
        write?(
            this: Writable,
            chunk: unknown,
            encoding: string,
            callback: (error?: Error | null) => void,
        ): void;
        final?(this: Writable, callback: (error?: Error | null) => void): void;
    }

    export class Writable extends Stream {
        constructor(opts?: WritableOptions);
        writable: boolean;
        write(
            chunk: unknown,
            encoding?: string,
            callback?: (error: Error | null | undefined) => void,
        ): boolean;
        end(cb?: () => void): this;
        end(chunk: unknown, cb?: () => void): this;
        end(chunk: unknown, encoding: string, cb?: () => void): this;
        destroy(error?: Error): this;
    }

    export interface DuplexOptions extends ReadableOptions, WritableOptions {
        allowHalfOpen?: boolean;
    }

    export class Duplex extends Readable {
        constructor(opts?: DuplexOptions);
        writable: boolean;
        write(
            chunk: unknown,
            encoding?: string,
            callback?: (error: Error | null | undefined) => void,
        ): boolean;
        end(cb?: () => void): this;
    }

    export interface TransformOptions extends DuplexOptions {
        transform?(
            this: Transform,
            chunk: unknown,
            encoding: string,
            callback: (error?: Error | null, data?: unknown) => void,
        ): void;
        flush?(this: Transform, callback: (error?: Error | null, data?: unknown) => void): void;
    }

    export class Transform extends Duplex {
        constructor(opts?: TransformOptions);
    }

    export class PassThrough extends Transform {}
}

// ---------------------------------------------------------------------
// util
// Limited subset actually implemented by skpm's polyfill (util-deprecate
// plus small shims). `inspect` returns something useful; `types.is*`
// covers the common narrow predicates.
// ---------------------------------------------------------------------

declare module 'util' {
    export interface InspectOptions {
        showHidden?: boolean;
        depth?: number | null;
        colors?: boolean;
        customInspect?: boolean;
        showProxy?: boolean;
        maxArrayLength?: number | null;
        maxStringLength?: number | null;
        breakLength?: number;
        compact?: boolean | number;
        sorted?: boolean | ((a: string, b: string) => number);
        getters?: 'get' | 'set' | boolean;
    }

    export function inspect(object: unknown, options?: InspectOptions): string;
    export function inspect(
        object: unknown,
        showHidden?: boolean,
        depth?: number | null,
        color?: boolean,
    ): string;

    export function format(format: string, ...args: unknown[]): string;
    export function formatWithOptions(
        inspectOptions: InspectOptions,
        format: string,
        ...args: unknown[]
    ): string;

    export function promisify<T>(
        fn: (callback: (err: Error | null, result: T) => void) => void,
    ): () => Promise<T>;
    export function promisify<A, T>(
        fn: (a: A, callback: (err: Error | null, result: T) => void) => void,
    ): (a: A) => Promise<T>;
    export function promisify<A, B, T>(
        fn: (a: A, b: B, callback: (err: Error | null, result: T) => void) => void,
    ): (a: A, b: B) => Promise<T>;
    export function promisify(fn: (...args: unknown[]) => void): (...args: unknown[]) => Promise<unknown>;

    export function callbackify<T>(
        fn: () => Promise<T>,
    ): (callback: (err: Error | null, result: T) => void) => void;
    export function callbackify<A, T>(
        fn: (a: A) => Promise<T>,
    ): (a: A, callback: (err: Error | null, result: T) => void) => void;
    export function callbackify(
        fn: (...args: unknown[]) => Promise<unknown>,
    ): (...args: unknown[]) => void;

    export function deprecate<T extends (...args: never[]) => unknown>(
        fn: T,
        msg: string,
        code?: string,
    ): T;

    export function inherits(constructor: unknown, superConstructor: unknown): void;

    export namespace types {
        function isDate(value: unknown): value is Date;
        function isRegExp(value: unknown): value is RegExp;
        function isNativeError(value: unknown): value is Error;
        function isPromise(value: unknown): value is Promise<unknown>;
        function isMap(value: unknown): value is Map<unknown, unknown>;
        function isSet(value: unknown): value is Set<unknown>;
        function isWeakMap(value: unknown): value is WeakMap<object, unknown>;
        function isWeakSet(value: unknown): value is WeakSet<object>;
        function isArrayBuffer(value: unknown): value is ArrayBuffer;
        function isSharedArrayBuffer(value: unknown): value is SharedArrayBuffer;
        function isTypedArray(value: unknown): value is ArrayBufferView;
        function isUint8Array(value: unknown): value is Uint8Array;
        function isAsyncFunction(value: unknown): boolean;
        function isGeneratorFunction(value: unknown): boolean;
        function isGeneratorObject(value: unknown): boolean;
        function isBoxedPrimitive(value: unknown): boolean;
        function isProxy(value: unknown): boolean;
        function isArgumentsObject(value: unknown): boolean;
    }
}

// ---------------------------------------------------------------------
// events
// Just enough of Node's EventEmitter to satisfy typical usage.
// ---------------------------------------------------------------------

declare module 'events' {
    export type EventListener = (...args: unknown[]) => void;

    export class EventEmitter {
        static defaultMaxListeners: number;
        static listenerCount(emitter: EventEmitter, event: string | symbol): number;

        addListener(event: string | symbol, listener: EventListener): this;
        on(event: string | symbol, listener: EventListener): this;
        once(event: string | symbol, listener: EventListener): this;
        off(event: string | symbol, listener: EventListener): this;
        removeListener(event: string | symbol, listener: EventListener): this;
        removeAllListeners(event?: string | symbol): this;
        setMaxListeners(n: number): this;
        getMaxListeners(): number;
        listeners(event: string | symbol): EventListener[];
        rawListeners(event: string | symbol): EventListener[];
        emit(event: string | symbol, ...args: unknown[]): boolean;
        listenerCount(event: string | symbol): number;
        prependListener(event: string | symbol, listener: EventListener): this;
        prependOnceListener(event: string | symbol, listener: EventListener): this;
        eventNames(): Array<string | symbol>;
    }

    // CommonJS default export — `require('events')` returns EventEmitter.
    export default EventEmitter;
}

// ---------------------------------------------------------------------
// url
// WHATWG `URL` class plus the legacy `parse` / `format` helpers.
// ---------------------------------------------------------------------

declare module 'url' {
    export interface UrlObject {
        protocol?: string | null;
        slashes?: boolean | null;
        auth?: string | null;
        host?: string | null;
        hostname?: string | null;
        port?: string | number | null;
        pathname?: string | null;
        search?: string | null;
        query?: string | Record<string, string | string[]> | null;
        hash?: string | null;
        href?: string | null;
        path?: string | null;
    }

    export interface UrlWithStringQuery extends UrlObject {
        query: string | null;
    }

    export function parse(urlString: string): UrlWithStringQuery;
    export function parse(
        urlString: string,
        parseQueryString: false,
        slashesDenoteHost?: boolean,
    ): UrlWithStringQuery;
    export function parse(
        urlString: string,
        parseQueryString: true,
        slashesDenoteHost?: boolean,
    ): UrlObject & { query: Record<string, string | string[]> };

    export function format(urlObject: UrlObject | URL): string;
    export function resolve(from: string, to: string): string;

    export class URLSearchParams {
        constructor(
            init?:
                | string
                | URLSearchParams
                | Record<string, string>
                | Iterable<[string, string]>,
        );
        append(name: string, value: string): void;
        delete(name: string): void;
        entries(): IterableIterator<[string, string]>;
        forEach(
            callback: (value: string, name: string, searchParams: URLSearchParams) => void,
        ): void;
        get(name: string): string | null;
        getAll(name: string): string[];
        has(name: string): boolean;
        keys(): IterableIterator<string>;
        set(name: string, value: string): void;
        sort(): void;
        toString(): string;
        values(): IterableIterator<string>;
        [Symbol.iterator](): IterableIterator<[string, string]>;
    }

    export class URL {
        constructor(input: string, base?: string | URL);
        hash: string;
        host: string;
        hostname: string;
        href: string;
        readonly origin: string;
        password: string;
        pathname: string;
        port: string;
        protocol: string;
        search: string;
        readonly searchParams: URLSearchParams;
        username: string;
        toString(): string;
        toJSON(): string;
    }

    export function pathToFileURL(path: string): URL;
    export function fileURLToPath(url: string | URL): string;
}

// ---------------------------------------------------------------------
// assert
// Only the narrow surface that skpm's polyfill actually wires up.
// ---------------------------------------------------------------------

declare module 'assert' {
    interface AssertFn {
        (value: unknown, message?: string | Error): asserts value;
        ok(value: unknown, message?: string | Error): asserts value;
        equal(actual: unknown, expected: unknown, message?: string | Error): void;
        notEqual(actual: unknown, expected: unknown, message?: string | Error): void;
        strictEqual<T>(actual: unknown, expected: T, message?: string | Error): asserts actual is T;
        notStrictEqual(actual: unknown, expected: unknown, message?: string | Error): void;
        deepEqual(actual: unknown, expected: unknown, message?: string | Error): void;
        notDeepEqual(actual: unknown, expected: unknown, message?: string | Error): void;
        deepStrictEqual<T>(
            actual: unknown,
            expected: T,
            message?: string | Error,
        ): asserts actual is T;
        notDeepStrictEqual(actual: unknown, expected: unknown, message?: string | Error): void;
        throws(block: () => unknown, error?: RegExp | Function | Error, message?: string): void;
        doesNotThrow(block: () => unknown, error?: RegExp | Function, message?: string): void;
        ifError(value: unknown): void;
        fail(message?: string | Error): never;
        fail(actual: unknown, expected: unknown, message?: string, operator?: string): never;
        AssertionError: new (options?: {
            message?: string;
            actual?: unknown;
            expected?: unknown;
            operator?: string;
        }) => Error;
    }

    const assert: AssertFn;
    export = assert;
}
