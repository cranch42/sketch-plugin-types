/// <reference path="./dom.d.ts" />

declare module 'sketch/data-supplier' {
    import { ImageData } from 'sketch/dom';

    export type DataType = 'public.text' | 'public.image';

    /**
     * Register a data source from the plugin's Startup handler. The
     * `dynamicDataKey` is the action identifier (typically the plugin command
     * name) that the Data menu will invoke when the supplier is chosen.
     */
    export function registerDataSupplier(
        dataType: DataType,
        dataName: string,
        dynamicDataKey: string,
    ): void;

    /** Deregister every data supplier registered by this plugin. */
    export function deregisterDataSuppliers(): void;

    /**
     * Supply a batch of data items in response to an invocation. The `key` is
     * the value from `context.data.key` delivered to the plugin command.
     */
    export function supplyData(
        key: string,
        data: string[] | ImageData[],
    ): void;

    /** Supply a single datum for a specific target index. */
    export function supplyDataAtIndex(
        key: string,
        datum: string | ImageData,
        index: number,
    ): void;
}
