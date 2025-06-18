export class SkiaBaseWebView extends React.Component<any, any, any> {
    constructor(props: any);
    unsubscribeAll(): void;
    _unsubscriptions: any[] | undefined;
    onLayoutEvent(evt: any): void;
    width: any;
    height: any;
    _surface: JsiSkSurface | undefined;
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
    makeImageSnapshot(rect: any): import("..").JsiSkImage | undefined;
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
    render(): React.CElement<import("react-native").ViewProps, import("react-native").View>;
}
import React from "react";
import { JsiSkSurface } from "../skia/web/JsiSkSurface";
