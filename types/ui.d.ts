/// <reference path="./native.d.ts" />
/// <reference path="./dom.d.ts" />

declare module 'sketch/ui' {
    import { Document } from 'sketch/dom';

    /** Temporary toast-style message at the bottom of the document window. */
    export function message(text: string, document?: Document): void;

    /** Modal OK-only alert. Returns the NSModalResponse integer. */
    export function alert(title: string, text: string): number;

    export type INPUT_TYPE = 'string' | 'slider' | 'selection';
    export const INPUT_TYPE: {
        readonly string: 'string';
        readonly slider: 'slider';
        readonly selection: 'selection';
    };

    export interface InputOptions {
        description?: string;
        type?: INPUT_TYPE;
        initialValue?: string | number;
        /** Enables a multi-line text area when `type === 'string'`. */
        numberOfLines?: number;
        /** Required when `type === 'selection'`. */
        possibleValues?: string[];
        /** Slider only. */
        minValue?: number;
        /** Slider only. */
        maxValue?: number;
        /** Slider snap interval. */
        increment?: number;
        okButton?: string;
        cancelButton?: string;
    }

    export type InputCallback = (
        err: SketchNative.NSError | null,
        value?: string | number,
    ) => void;

    export function getInputFromUser(
        message: string,
        options?: InputOptions,
        callback?: InputCallback,
    ): void;

    /** @deprecated Use `getInputFromUser` with `type: 'string'`. */
    export function getStringFromUser(
        message: string,
        initialValue?: string,
    ): string;

    /**
     * @deprecated Use `getInputFromUser` with `type: 'selection'`.
     * Returns `[responseCode, selectedIndex, okWasClicked]`.
     */
    export function getSelectionFromUser(
        message: string,
        items: string[],
        selectedItemIndex?: number,
    ): [responseCode: number, selection: number, ok: boolean];

    export function getTheme(): 'light' | 'dark';
}
