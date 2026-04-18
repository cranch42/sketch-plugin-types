/// <reference path="./dom.d.ts" />
/// <reference path="./ui.d.ts" />
/// <reference path="./settings.d.ts" />
/// <reference path="./async.d.ts" />
/// <reference path="./data-supplier.d.ts" />

/**
 * `require('sketch')` is a convenience facade: everything from
 * `sketch/dom` plus the four sub-modules attached as properties.
 */
declare module 'sketch' {
    import * as Dom from 'sketch/dom';
    import * as _UI from 'sketch/ui';
    import * as _Settings from 'sketch/settings';
    import * as _Async from 'sketch/async';
    import * as _DataSupplier from 'sketch/data-supplier';

    export = sketch;

    const sketch: typeof Dom & {
        UI: typeof _UI;
        Settings: typeof _Settings;
        Async: typeof _Async;
        DataSupplier: typeof _DataSupplier;
        /** Alias of `exportObject`. Matches the name used in Sketch's docs. */
        export: typeof Dom.exportObject;
    };
}
