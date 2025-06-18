import type { CanvasKit } from "canvaskit-wasm";
import type { ColorFilterFactory, SkColorFilter, InputColorMatrix, SkColor, BlendMode } from "../types";
import { Host } from "./Host";
import { JsiSkColorFilter } from "./JsiSkColorFilter";
export declare class JsiSkColorFilterFactory extends Host implements ColorFilterFactory {
    constructor(CanvasKit: CanvasKit);
    MakeMatrix(cMatrix: InputColorMatrix): JsiSkColorFilter;
    MakeBlend(color: SkColor, mode: BlendMode): JsiSkColorFilter;
    MakeCompose(outer: SkColorFilter, inner: SkColorFilter): JsiSkColorFilter;
    MakeLerp(t: number, dst: SkColorFilter, src: SkColorFilter): JsiSkColorFilter;
    MakeLinearToSRGBGamma(): JsiSkColorFilter;
    MakeSRGBToLinearGamma(): JsiSkColorFilter;
    MakeLumaColorFilter(): SkColorFilter;
}
