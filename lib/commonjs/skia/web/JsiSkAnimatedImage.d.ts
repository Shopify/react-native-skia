import type { AnimatedImage, CanvasKit } from "canvaskit-wasm";
import type { SkAnimatedImage } from "../types/AnimatedImage";
import { HostObject } from "./Host";
import { JsiSkImage } from "./JsiSkImage";
export declare class JsiSkAnimatedImage extends HostObject<AnimatedImage, "AnimatedImage"> implements SkAnimatedImage {
    constructor(CanvasKit: CanvasKit, ref: AnimatedImage);
    decodeNextFrame(): number;
    currentFrameDuration(): number;
    getFrameCount(): number;
    getCurrentFrame(): JsiSkImage | null;
    dispose: () => void;
}
