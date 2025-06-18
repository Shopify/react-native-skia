import type { CanvasKit } from "canvaskit-wasm";
import type { RuntimeEffectFactory } from "../types/RuntimeEffect/RuntimeEffectFactory";
import { Host } from "./Host";
import { JsiSkRuntimeEffect } from "./JsiSkRuntimeEffect";
export declare class JsiSkRuntimeEffectFactory extends Host implements RuntimeEffectFactory {
    constructor(CanvasKit: CanvasKit);
    Make(sksl: string): JsiSkRuntimeEffect | null;
}
