import type { CanvasKit } from "canvaskit-wasm";

import type {
  SkImageFilter,
  ColorChannel,
  ImageFilterFactory,
  SkColor,
  SkColorFilter,
  BlendMode,
  SkRect,
  SkRuntimeShaderBuilder,
  SkShader,
  TileMode,
} from "../types";

import { Host, NotImplementedOnRNWeb, ckEnum, toValue } from "./Host";
import { JsiSkImageFilter } from "./JsiSkImageFilter";

export class JsiSkImageFilterFactory
  extends Host
  implements ImageFilterFactory
{
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  MakeOffset(dx: number, dy: number, input: SkImageFilter | null) {
    return new JsiSkImageFilter(
      this.CanvasKit,
      this.CanvasKit.ImageFilter.MakeOffset(
        dx,
        dy,
        input === null ? null : toValue(input)
      )
    );
  }

  MakeDisplacementMap(
    channelX: ColorChannel,
    channelY: ColorChannel,
    scale: number,
    in1: SkImageFilter,
    input: SkImageFilter | null
  ) {
    return new JsiSkImageFilter(
      this.CanvasKit,
      this.CanvasKit.ImageFilter.MakeDisplacementMap(
        ckEnum(channelX),
        ckEnum(channelY),
        scale,
        toValue(in1),
        input === null ? null : toValue(input)
      )
    );
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
        input === null ? null : toValue(input)
      )
    );
  }

  MakeColorFilter(cf: SkColorFilter, input: SkImageFilter | null) {
    return new JsiSkImageFilter(
      this.CanvasKit,
      this.CanvasKit.ImageFilter.MakeColorFilter(
        toValue(cf),
        input === null ? null : toValue(input)
      )
    );
  }

  MakeCompose(outer: SkImageFilter | null, inner: SkImageFilter | null) {
    return new JsiSkImageFilter(
      this.CanvasKit,
      this.CanvasKit.ImageFilter.MakeCompose(
        outer === null ? null : toValue(outer),
        inner === null ? null : toValue(inner)
      )
    );
  }

  MakeDropShadow(
    dx: number,
    dy: number,
    sigmaX: number,
    sigmaY: number,
    color: SkColor,
    input: SkImageFilter | null,
    _cropRect?: SkRect
  ) {
    return new JsiSkImageFilter(
      this.CanvasKit,
      this.CanvasKit.ImageFilter.MakeDropShadow(
        dx,
        dy,
        sigmaX,
        sigmaY,
        color,
        input === null ? null : toValue(input)
      )
    );
  }

  MakeDropShadowOnly(
    dx: number,
    dy: number,
    sigmaX: number,
    sigmaY: number,
    color: SkColor,
    input: SkImageFilter | null,
    _cropRect?: SkRect
  ) {
    return new JsiSkImageFilter(
      this.CanvasKit,
      this.CanvasKit.ImageFilter.MakeDropShadowOnly(
        dx,
        dy,
        sigmaX,
        sigmaY,
        color,
        input === null ? null : toValue(input)
      )
    );
  }

  MakeErode(
    rx: number,
    ry: number,
    input: SkImageFilter | null,
    _cropRect?: SkRect
  ): SkImageFilter {
    return new JsiSkImageFilter(
      this.CanvasKit,
      this.CanvasKit.ImageFilter.MakeErode(
        rx,
        ry,
        input === null ? null : toValue(input)
      )
    );
  }

  MakeDilate(
    rx: number,
    ry: number,
    input: SkImageFilter | null,
    _cropRect?: SkRect
  ) {
    return new JsiSkImageFilter(
      this.CanvasKit,
      this.CanvasKit.ImageFilter.MakeDilate(
        rx,
        ry,
        input === null ? null : toValue(input)
      )
    );
  }

  MakeBlend(
    mode: BlendMode,
    background: SkImageFilter,
    foreground: SkImageFilter | null,
    _cropRect?: SkRect
  ) {
    return new JsiSkImageFilter(
      this.CanvasKit,
      this.CanvasKit.ImageFilter.MakeBlend(
        ckEnum(mode),
        background === null ? null : toValue(background),
        foreground === null ? null : toValue(foreground)
      )
    );
  }

  MakeRuntimeShader(
    _builder: SkRuntimeShaderBuilder,
    _childShaderName: string | null,
    _input: SkImageFilter | null
  ): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }
}
