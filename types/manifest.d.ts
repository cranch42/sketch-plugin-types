/// <reference path="./actions.d.ts" />

import type { SketchActionKey } from './actions';

/**
 * Shape of a Sketch plugin `manifest.json`. Reference:
 * https://developer.sketch.com/plugins/plugin-manifest.
 */
export interface SketchManifest {
    /** Human-readable plugin name. */
    name: string;
    /** Reverse-domain, globally unique identifier. */
    identifier: string;
    /** Semantic version, compared against the appcast entry. */
    version: string;
    description: string;
    author: string;
    authorEmail?: string;

    /** URL of the updater JSON feed. */
    appcast?: string;
    homepage?: string;

    /** Minimum Sketch version (semver). */
    compatibleVersion?: string;
    /** Informational only; not enforced by Sketch. */
    maxCompatibleVersion?: string;
    /** Defaults to `1` when omitted. */
    bundleVersion?: number;

    /** 128x128 PNG path inside `Contents/Resources`. */
    icon?: string;
    /** Icon shown inside `UI.alert` dialogs; path inside `Contents/Resources`. */
    alertIcon?: string;

    /** `'document'` (default): one plugin instance per open document.
     *  `'application'`: a single background instance shared across documents. */
    scope?: 'document' | 'application';

    /** Marks this plugin as a Data Supplier. */
    suppliesData?: boolean;

    /** Required when using skpm (ES6+ bundled output). */
    disableCocoaScriptPreprocessor?: boolean;

    commands: SketchManifestCommand[];
    menu?: SketchManifestMenu;
}

export interface SketchManifestCommand {
    /** Menu label. */
    name: string;
    /** Unique within the bundle. */
    identifier: string;
    /** Relative path inside `Contents/Sketch/`. */
    script: string;
    /**
     * Top-level function name in `script` to invoke. Defaults to `onRun`.
     *
     * When bundling with `@skpm/builder`, the export shape of the command
     * module is tied to this name:
     *
     * - `handler: "onRun"` (or omitted) — skpm expects
     *   `export default function (context) { … }`. A named `export function
     *   onRun` is NOT picked up.
     * - any other value, e.g. `handler: "start"` — skpm expects
     *   `export function start(context) { … }` (named export matching the
     *   handler field).
     *
     * A mismatch throws at runtime with `Error: Missing export named
     * "<handler>". Your command should contain something like
     * \`export function <handler>() {}\`.` — not at build time. See
     * `docs/skpm.md`.
     */
    handler?: string;
    /**
     * Advanced handler map. Takes precedence over `handler`. Each entry
     * must resolve to a **named** export in the command module, regardless
     * of the name — `export default` is ignored here.
     */
    handlers?: SketchManifestHandlers;
    /** Keyboard shortcut, e.g. `"cmd shift k"`. Must include at least one modifier. */
    shortcut?: SketchShortcut;
    /** Per-command icon path inside `Contents/Resources`. */
    icon?: string;
    /** Hides the command from the plugin menu (still runnable via action handlers). */
    isInternal?: boolean;
}

export interface SketchManifestHandlers {
    /** Equivalent to the top-level `handler`. */
    run?: string;
    /** Called before every command invocation. */
    setUp?: string;
    /** Called after every command invocation. */
    tearDown?: string;
    /** Called whenever the active document changes. */
    onDocumentChanged?: string;
    /** Map of action keys to exported function names in the command script. */
    actions?: Partial<Record<SketchActionKey, string>>;
}

/**
 * Space-separated tokens; must include at least one of the modifiers
 * `cmd`, `alt`, `ctrl`, `shift`. Examples: `"cmd shift k"`, `"alt +"`.
 */
export type SketchShortcut = string;

export interface SketchManifestMenuItem {
    title: string;
    items?: Array<SketchManifestMenuItemEntry>;
}

/**
 * Menu entry — either a command `identifier`, a literal `"-"` separator, or
 * a nested submenu object.
 */
export type SketchManifestMenuItemEntry =
    | string
    | '-'
    | SketchManifestMenuItem;

export interface SketchManifestMenu {
    title?: string;
    /** Put items directly under the Plugins menu rather than in a submenu. */
    isRoot?: boolean;
    items: SketchManifestMenuItemEntry[];
}

/**
 * Identity helper for `manifest.json` authored in TypeScript — gives editor
 * autocomplete and typechecking without changing the runtime value.
 */
export function defineManifest<const T extends SketchManifest>(manifest: T): T;
