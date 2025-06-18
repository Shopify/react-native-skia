export const __esModule: boolean;
declare const SkiaBaseWebView_base: any;
export class SkiaBaseWebView extends SkiaBaseWebView_base {
    [x: string]: any;
    constructor(props: any);
    unsubscribeAll(): void;
    _unsubscriptions: any[] | undefined;
    onLayoutEvent(evt: any): void;
    width: any;
    height: any;
    _surface: _JsiSkSurface.JsiSkSurface | undefined;
    _canvas: import("../skia/web/JsiSkCanvas").JsiSkCanvas | undefined;
    getSize(): {
        width: any;
        height: any;
    };
    componentDidMount(): void;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    /**
     * Creates a snapshot from the canvas in the surface
     * @param rect Rect to use as bounds. Optional.
     * @returns An Image object.
     */
    makeImageSnapshot(rect: any): import("../skia/web/JsiSkImage").JsiSkImage | undefined;
    /**
     * Override to render
     */
    /**
     * Sends a redraw request to the native SkiaView.
     */
    tick(): void;
    _redrawRequests: number | undefined;
    requestId: number | undefined;
    redraw(): void;
    render(): any;
}
import _JsiSkSurface = require("../skia/web/JsiSkSurface");
export {};
