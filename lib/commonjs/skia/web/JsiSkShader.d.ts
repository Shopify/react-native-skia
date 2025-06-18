import type { CanvasKit, Shader } from "canvaskit-wasm";
import type { SkShader } from "../types";
import { HostObject } from "./Host";
export declare class JsiSkShader extends HostObject<Shader, "Shader"> implements SkShader {
    constructor(CanvasKit: CanvasKit, ref: Shader);
    dispose: () => void;
}
