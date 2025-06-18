import type { CanvasKit } from "canvaskit-wasm";
import type { ColorChannel, ImageFilterFactory, SkColor, SkColorFilter, SkImageFilter, BlendMode, SkRect, SkRuntimeShaderBuilder, SkShader, TileMode } from "../types";
import { Host } from "./Host";
import { JsiSkImageFilter } from "./JsiSkImageFilter";
export declare class JsiSkImageFilterFactory extends Host implements ImageFilterFactory {
    constructor(CanvasKit: CanvasKit);
    MakeOffset(dx: number, dy: number, input: SkImageFilter | null): JsiSkImageFilter;
    MakeDisplacementMap(channelX: ColorChannel, channelY: ColorChannel, scale: number, in1: SkImageFilter, input: SkImageFilter | null): SkImageFilter;
    MakeShader(shader: SkShader, _input: SkImageFilter | null): SkImageFilter;
    MakeBlur(sigmaX: number, sigmaY: number, mode: TileMode, input: SkImageFilter | null): JsiSkImageFilter;
    MakeColorFilter(cf: SkColorFilter, input: SkImageFilter | null): JsiSkImageFilter;
    MakeCompose(outer: SkImageFilter | null, inner: SkImageFilter | null): JsiSkImageFilter;
    MakeDropShadow(dx: number, dy: number, sigmaX: number, sigmaY: number, color: SkColor, input: SkImageFilter | null, cropRect?: SkRect): SkImageFilter;
    MakeDropShadowOnly(dx: number, dy: number, sigmaX: number, sigmaY: number, color: SkColor, input: SkImageFilter | null, cropRect?: SkRect): SkImageFilter;
    MakeErode(rx: number, ry: number, input: SkImageFilter | null, cropRect?: SkRect): SkImageFilter;
    MakeDilate(rx: number, ry: number, input: SkImageFilter | null, cropRect?: SkRect): SkImageFilter;
    MakeBlend(mode: BlendMode, background: SkImageFilter, foreground: SkImageFilter | null, cropRect?: SkRect): SkImageFilter;
    MakeRuntimeShader(_builder: SkRuntimeShaderBuilder, _childShaderName: string | null, _input: SkImageFilter | null): SkImageFilter;
}
