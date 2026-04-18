/// <reference path="./dom.d.ts" />

declare module 'sketch/settings' {
    import { Document, Layer, Override, DataOverride } from 'sketch/dom';

    /**
     * All setters/getters JSON-serialise their values. Setting a value of
     * `undefined` deletes the entry.
     */

    // Plugin-scoped (persists across Sketch launches).
    export function settingForKey<T = unknown>(key: string): T | undefined;
    export function setSettingForKey(key: string, value: unknown): void;

    // System-wide (NSUserDefaults on `com.bohemiancoding.sketch3`).
    export function globalSettingForKey<T = unknown>(key: string): T | undefined;
    export function setGlobalSettingForKey(key: string, value: unknown): void;

    // Per-document (travels with the .sketch file).
    export function documentSettingForKey<T = unknown>(
        document: Document,
        key: string,
    ): T | undefined;
    export function setDocumentSettingForKey(
        document: Document,
        key: string,
        value: unknown,
    ): void;

    // Per-layer (also accepts Override and DataOverride).
    export function layerSettingForKey<T = unknown>(
        layer: Layer | Override | DataOverride,
        key: string,
    ): T | undefined;
    export function setLayerSettingForKey(
        layer: Layer | Override | DataOverride,
        key: string,
        value: unknown,
    ): void;

    // Session-scoped (cleared when Sketch quits).
    export function sessionVariable<T = unknown>(key: string): T | undefined;
    export function setSessionVariable(key: string, value: unknown): void;
}
