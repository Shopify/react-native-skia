import type { CanvasKit, RuntimeEffect } from "canvaskit-wasm";
import type { SkMatrix, SkShader } from "../types";
import type { SkRuntimeEffect } from "../types/RuntimeEffect/RuntimeEffect";
import { HostObject } from "./Host";
import { JsiSkShader } from "./JsiSkShader";
export declare class JsiSkRuntimeEffect extends HostObject<RuntimeEffect, "RuntimeEffect"> implements SkRuntimeEffect {
    private sksl;
    constructor(CanvasKit: CanvasKit, ref: RuntimeEffect, sksl: string);
    dispose: () => void;
    source(): string;
    makeShader(uniforms: number[], localMatrix?: SkMatrix): JsiSkShader;
    makeShaderWithChildren(uniforms: number[], children?: SkShader[], localMatrix?: SkMatrix): JsiSkShader;
    getUniform(index: number): import("canvaskit-wasm").SkSLUniform;
    getUniformCount(): number;
    getUniformFloatCount(): number;
    getUniformName(index: number): string;
}
