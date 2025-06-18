import type { SkCanvas, SkRect, SkSize } from "../types";
/**
 * Memoizes and returns an SkPicture that can be drawn to another canvas.
 * @param rect Picture bounds
 * @param cb Callback for drawing to the canvas
 * @returns SkPicture
 */
export declare const createPicture: (cb: (canvas: SkCanvas) => void, rect?: SkRect | SkSize) => import("../types").SkPicture;
