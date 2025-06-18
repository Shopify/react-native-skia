import type { CanvasKit, TextBlob } from "canvaskit-wasm";
import type { SkTextBlob } from "../types";
import { HostObject } from "./Host";
export declare class JsiSkTextBlob extends HostObject<TextBlob, "TextBlob"> implements SkTextBlob {
    constructor(CanvasKit: CanvasKit, ref: TextBlob);
    dispose: () => void;
}
