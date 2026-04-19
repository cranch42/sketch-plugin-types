#!/usr/bin/env node
// Compile a TS/JS module whose default export is a SketchManifest into manifest.json.
"use strict";

const path = require("path");
const fs = require("fs");
const Module = require("module");

const USAGE = "Usage: build-manifest <input> [--out <path>]";

function die(msg) {
    process.stderr.write("build-manifest: " + msg + "\n");
    process.exit(1);
}

function parseArgs(argv) {
    const args = { input: null, out: null };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === "--help" || a === "-h") { process.stdout.write(USAGE + "\n"); process.exit(0); }
        else if (a === "--out") args.out = argv[++i];
        else if (a.startsWith("--")) die("unknown flag: " + a);
        else if (args.input === null) args.input = a;
        else die("unexpected argument: " + a);
    }
    if (!args.input) die(USAGE);
    return args;
}

function tryResolve(spec, from) {
    try {
        const req = Module.createRequire(path.join(from, "noop.js"));
        return req.resolve(spec);
    } catch (_) { return null; }
}

async function loadTs(absInput) {
    const projectDir = process.cwd();
    const tsxEntry = tryResolve("tsx/cjs/api", projectDir);
    if (tsxEntry) {
        try {
            const api = require(tsxEntry);
            return api.require(absInput, path.join(projectDir, "noop.js"));
        } catch (e) { die("failed loading via tsx: " + (e && e.message || e)); }
    }
    const tsNodeEntry = tryResolve("ts-node/register/transpile-only", projectDir);
    if (tsNodeEntry) {
        try {
            require(tsNodeEntry);
            return await import(require("url").pathToFileURL(absInput).href);
        } catch (e) { die("failed loading via ts-node: " + (e && e.message || e)); }
    }
    die('to load a TypeScript manifest source, install "tsx" or "ts-node" as a devDependency of your plugin project.');
}

async function loadModule(absInput) {
    const ext = path.extname(absInput).toLowerCase();
    if (ext === ".js" || ext === ".mjs" || ext === ".cjs") {
        return await import(require("url").pathToFileURL(absInput).href);
    }
    if (ext === ".ts" || ext === ".tsx" || ext === ".mts" || ext === ".cts") {
        return await loadTs(absInput);
    }
    die("unsupported input extension: " + ext);
}

function pickDefault(mod) {
    let value = mod && typeof mod === "object" && "default" in mod ? mod.default : mod;
    if (value && typeof value === "object" && "default" in value && Object.keys(value).length === 1) {
        value = value.default;
    }
    if (typeof value === "function") value = value();
    return value;
}

function isPlainObject(v) {
    if (!v || typeof v !== "object" || Array.isArray(v)) return false;
    const proto = Object.getPrototypeOf(v);
    return proto === null || proto === Object.prototype;
}

(async () => {
    const args = parseArgs(process.argv.slice(2));
    const absInput = path.resolve(process.cwd(), args.input);
    if (!fs.existsSync(absInput)) die("input not found: " + absInput);

    let mod;
    try { mod = await loadModule(absInput); }
    catch (e) { die("failed to import input: " + (e && e.message || e)); }

    const value = pickDefault(mod);
    if (value === undefined || value === null) die("input has no default export");
    if (!isPlainObject(value)) die("default export must be a plain object, got " + typeof value);

    const absOut = args.out
        ? path.resolve(process.cwd(), args.out)
        : path.join(path.dirname(absInput), "manifest.json");

    fs.mkdirSync(path.dirname(absOut), { recursive: true });
    fs.writeFileSync(absOut, JSON.stringify(value, null, 2) + "\n");
    process.stdout.write("wrote " + absOut + "\n");
})().catch((e) => die(e && e.message || String(e)));
