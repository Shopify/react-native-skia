import type { CanvasKit } from "canvaskit-wasm";
import type { SkData } from "../types";
import type { AnimatedImageFactory } from "../types/AnimatedImage/AnimatedImageFactory";
import { Host } from "./Host";
import { JsiSkAnimatedImage } from "./JsiSkAnimatedImage";
export declare class JsiSkAnimatedImageFactory extends Host implements AnimatedImageFactory {
    constructor(CanvasKit: CanvasKit);
    MakeAnimatedImageFromEncoded(encoded: SkData): JsiSkAnimatedImage | null;
}
