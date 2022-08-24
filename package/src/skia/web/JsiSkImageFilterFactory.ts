import type { CanvasKit } from "canvaskit-wasm";

import type {
  ColorChannel,
  ImageFilterFactory,
  SkColor,
  SkColorFilter,
  SkImageFilter,
  BlendMode,
  SkRect,
  SkRuntimeShaderBuilder,
  SkShader,
  TileMode,
} from "../types";

import { Host, NotImplementedOnRNWeb, ckEnum } from "./Host";
import { JsiSkImageFilter } from "./JsiSkImageFilter";
import { JsiSkColorFilter } from "./JsiSkColorFilter";

export class JsiSkImageFilterFactory
  extends Host
  implements ImageFilterFactory
{
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  MakeOffset(
    _dx: number,
    _dy: number,
    _input: SkImageFilter | null
  ): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }

  MakeDisplacementMap(
    _channelX: ColorChannel,
    _channelY: ColorChannel,
    _scale: number,
    _in1: SkImageFilter,
    _input: SkImageFilter | null
  ): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }

  MakeShader(_shader: SkShader, _input: SkImageFilter | null): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }

  MakeBlur(
    sigmaX: number,
    sigmaY: number,
    mode: TileMode,
    input: SkImageFilter | null
  ) {
    return new JsiSkImageFilter(
      this.CanvasKit,
      this.CanvasKit.ImageFilter.MakeBlur(
        sigmaX,
        sigmaY,
        ckEnum(mode),
        input === null ? null : JsiSkImageFilter.fromValue(input)
      )
    );
  }

  MakeColorFilter(cf: SkColorFilter, input: SkImageFilter | null) {
    return new JsiSkImageFilter(
      this.CanvasKit,
      this.CanvasKit.ImageFilter.MakeColorFilter(
        JsiSkColorFilter.fromValue(cf),
        input === null ? null : JsiSkImageFilter.fromValue(input)
      )
    );
  }

  MakeCompose(outer: SkImageFilter | null, inner: SkImageFilter | null) {
    return new JsiSkImageFilter(
      this.CanvasKit,
      this.CanvasKit.ImageFilter.MakeCompose(
        outer === null ? null : JsiSkImageFilter.fromValue(outer),
        inner === null ? null : JsiSkImageFilter.fromValue(inner)
      )
    );
  }

  MakeDropShadow(
    _dx: number,
    _dy: number,
    _sigmaX: number,
    _sigmaY: number,
    _color: SkColor,
    _input: SkImageFilter | null,
    _cropRect?: SkRect
  ): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }

  MakeDropShadowOnly(
    _dx: number,
    _dy: number,
    _sigmaX: number,
    _sigmaY: number,
    _color: SkColor,
    _input: SkImageFilter | null,
    _cropRect?: SkRect
  ): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }

  MakeErode(
    _rx: number,
    _ry: number,
    _input: SkImageFilter | null,
    _cropRect?: SkRect
  ): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }

  MakeDilate(
    _rx: number,
    _ry: number,
    _input: SkImageFilter | null,
    _cropRect?: SkRect
  ): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }

  MakeBlend(
    _mode: BlendMode,
    _background: SkImageFilter,
    _foreground: SkImageFilter | null,
    _cropRect?: SkRect
  ): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }

  MakeRuntimeShader(
    _builder: SkRuntimeShaderBuilder,
    _childShaderName: string | null,
    _input: SkImageFilter | null
  ): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }
}
