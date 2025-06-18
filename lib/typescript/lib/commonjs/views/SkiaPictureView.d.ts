export const __esModule: boolean;
declare const SkiaPictureView_base: any;
export class SkiaPictureView extends SkiaPictureView_base {
    [x: string]: any;
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
    render(): any;
}
export {};
