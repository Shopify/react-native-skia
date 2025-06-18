import type { SkRect } from "../../../skia/types";
import type { Fit } from "../../types";
export interface Size {
    width: number;
    height: number;
}
export declare const size: (width?: number, height?: number) => {
    width: number;
    height: number;
};
export declare const rect2rect: (src: SkRect, dst: SkRect) => [{
    translateX: number;
}, {
    translateY: number;
}, {
    scaleX: number;
}, {
    scaleY: number;
}];
export declare const fitRects: (fit: Fit, rect: SkRect, { x, y, width, height }: SkRect) => {
    src: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    dst: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
};
