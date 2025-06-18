import type { CanvasKit } from "canvaskit-wasm";
import { Host } from "./Host";
import { JsiSkTypefaceFontProvider } from "./JsiSkTypefaceFontProvider";
export declare class JsiSkTypefaceFontProviderFactory extends Host implements JsiSkTypefaceFontProviderFactory {
    constructor(CanvasKit: CanvasKit);
    Make(): JsiSkTypefaceFontProvider;
}
