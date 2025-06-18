export class SkiaPictureView extends React.Component<any, any, any> {
    constructor(props: any);
    _nativeId: number;
    get nativeId(): number;
    componentDidUpdate(prevProps: any): void;
    componentWillUnmount(): void;
    tick(): void;
    requestId: number | undefined;
    /**
     * Creates a snapshot from the canvas in the surface
     * @param rect Rect to use as bounds. Optional.
     * @returns An Image object.
     */
    makeImageSnapshot(rect: any): import("../../..").SkImage;
    /**
     * Sends a redraw request to the native SkiaView.
     */
    redraw(): void;
    render(): React.CElement<object, React.Component<object, {}, any> & Readonly<import("react-native").NativeMethods>>;
}
import React from "react";
