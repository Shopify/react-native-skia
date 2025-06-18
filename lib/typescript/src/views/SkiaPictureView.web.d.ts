import type { SkCanvas, SkPicture } from "../skia/types";
import type { SkiaPictureViewNativeProps } from "./types";
import { SkiaBaseWebView } from "./SkiaBaseWebView";
export declare class SkiaPictureView extends SkiaBaseWebView<SkiaPictureViewNativeProps> {
    private picture;
    constructor(props: SkiaPictureViewNativeProps);
    setPicture(picture: SkPicture): void;
    protected renderInCanvas(canvas: SkCanvas): void;
}
