import React from "react";
import type { SkRect, SkCanvas } from "../skia/types";
import type { SkiaBaseViewProps } from "./types";
export declare abstract class SkiaBaseWebView<TProps extends SkiaBaseViewProps> extends React.Component<TProps> {
    constructor(props: TProps);
    private _surface;
    private _unsubscriptions;
    private _canvas;
    private _canvasRef;
    private _redrawRequests;
    private requestId;
    protected width: number;
    protected height: number;
    private unsubscribeAll;
    private onLayoutEvent;
    protected getSize(): {
        width: number;
        height: number;
    };
    componentDidMount(): void;
    componentDidUpdate(): void;
    componentWillUnmount(): void;
    /**
     * Creates a snapshot from the canvas in the surface
     * @param rect Rect to use as bounds. Optional.
     * @returns An Image object.
     */
    makeImageSnapshot(rect?: SkRect): import("../skia/types").SkImage | undefined;
    /**
     * Override to render
     */
    protected abstract renderInCanvas(canvas: SkCanvas): void;
    /**
     * Sends a redraw request to the native SkiaView.
     */
    private tick;
    redraw(): void;
    private onLayout;
    render(): React.JSX.Element;
}
