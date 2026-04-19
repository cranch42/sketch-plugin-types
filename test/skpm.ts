// Smoke test for the types declared in `types/skpm/index.d.ts`. If this
// file typechecks, a plugin built with `@skpm/builder` can `require()`
// these modules with autocomplete.

import 'sketch-plugin-types/skpm';

import { Buffer, INSPECT_MAX_BYTES } from 'buffer';
import type { BufferEncoding } from 'buffer';
import * as path from 'path';
import { createHash, randomBytes } from 'crypto';
import { Readable, Writable, Transform, PassThrough } from 'stream';
import * as util from 'util';
import EventEmitter from 'events';
import { URL, URLSearchParams } from 'url';
import assert from 'assert';

// ---------------------------------------------------------------------
// buffer
// ---------------------------------------------------------------------

export function roundTripBuffer(): string {
    const fromString = Buffer.from('Hello, skpm', 'utf8');
    const fromArray = Buffer.from([0xde, 0xad, 0xbe, 0xef]);
    const allocated = Buffer.alloc(8, 0);

    const merged = Buffer.concat([fromString, fromArray, allocated]);
    const tail = merged.slice(fromString.length);

    const encoding: BufferEncoding = 'hex';
    const head = fromString.toString();
    const hex = tail.toString(encoding);

    const size: number = merged.length;
    const ceiling: number = INSPECT_MAX_BYTES;

    return `${head}|${hex}|${size}|${ceiling}`;
}

export function isThisABuffer(x: unknown): boolean {
    return Buffer.isBuffer(x);
}

// ---------------------------------------------------------------------
// path
// ---------------------------------------------------------------------

export function describePath(p: string): string {
    const joined = path.join('/tmp', 'sketch', 'out.png');
    const resolved = path.resolve('.', p);
    const base = path.basename(resolved, path.extname(resolved));
    const dir = path.dirname(resolved);

    const { root, name, ext } = path.parse(resolved);
    const delimiter: '/' = path.sep;

    return [joined, dir, base, root, name, ext, delimiter].join(' ');
}

// ---------------------------------------------------------------------
// crypto
// ---------------------------------------------------------------------

export function sha256Hex(input: string): string {
    return createHash('sha256').update(input).digest('hex');
}

export function nonce(): string {
    return randomBytes(16).toString('hex');
}

// ---------------------------------------------------------------------
// stream
// ---------------------------------------------------------------------

export function acceptStreams(r: Readable, w: Writable, t: Transform): Writable {
    // PassThrough exists as a class — instantiate it to confirm the type.
    const pt = new PassThrough();
    r.pipe(pt).pipe(w);
    // Transform is a Duplex; returning it as Writable exercises the hierarchy.
    return t;
}

// ---------------------------------------------------------------------
// util
// ---------------------------------------------------------------------

export function describe(obj: unknown): string {
    const rendered = util.inspect(obj, { depth: 2, colors: false });
    return util.format('obj=%s', rendered);
}

export function promisified(): Promise<number> {
    const callbackStyle = (cb: (err: Error | null, result: number) => void): void => {
        cb(null, 42);
    };
    const asPromise = util.promisify(callbackStyle);
    return asPromise();
}

// ---------------------------------------------------------------------
// events
// ---------------------------------------------------------------------

export function wireEmitter(): EventEmitter {
    const emitter = new EventEmitter();
    emitter.on('tick', (...args: unknown[]) => {
        log(args.length);
    });
    emitter.emit('tick', 1, 'two');
    return emitter;
}

// ---------------------------------------------------------------------
// url
// ---------------------------------------------------------------------

export function inspectUrl(): string {
    const u = new URL('https://example.com/x?y=1');
    const pathname: string = u.pathname;
    const params: URLSearchParams = u.searchParams;
    const y = params.get('y') ?? '';
    return `${pathname}?y=${y}`;
}

// ---------------------------------------------------------------------
// assert
// ---------------------------------------------------------------------

export function sanityCheck(value: unknown): number {
    assert(value, 'value must be truthy');
    assert.strictEqual(typeof value, 'string');
    // After strictEqual, `typeof value` is 'string' — we can narrow ourselves.
    const s = value as string;
    assert.deepStrictEqual({ len: s.length }, { len: s.length });
    return s.length;
}
