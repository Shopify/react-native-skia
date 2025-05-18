import type { CanvasKit, ImageFilter } from "canvaskit-wasm";

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

import { Host, throwNotImplementedOnRNWeb, getEnum } from "./Host";
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
    dx: number,
    dy: number,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ) {
    const inputFilter =
      input === null || input === undefined
        ? null
        : JsiSkImageFilter.fromValue<ImageFilter>(input);
    if (cropRect) {
      console.warn(
        "cropRect is not supported on React Native Web for MakeOffset"
      );
    }
    const filter = this.CanvasKit.ImageFilter.MakeOffset(dx, dy, inputFilter);
    return new JsiSkImageFilter(this.CanvasKit, filter);
  }

  MakeDisplacementMap(
    channelX: ColorChannel,
    channelY: ColorChannel,
    scale: number,
    in1: SkImageFilter,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ): SkImageFilter {
    const inputFilter =
      input === null || input === undefined
        ? null
        : JsiSkImageFilter.fromValue<ImageFilter>(input);
    if (cropRect) {
      console.warn(
        "cropRect is not supported on React Native Web for MakeDisplacementMap"
      );
    }
    const filter = this.CanvasKit.ImageFilter.MakeDisplacementMap(
      getEnum(this.CanvasKit, "ColorChannel", channelX),
      getEnum(this.CanvasKit, "ColorChannel", channelY),
      scale,
      JsiSkImageFilter.fromValue(in1),
      inputFilter
    );
    return new JsiSkImageFilter(this.CanvasKit, filter);
  }

  MakeShader(
    shader: SkShader,
    dither?: boolean,
    cropRect?: SkRect | null
  ): SkImageFilter {
    if (dither !== undefined) {
      console.warn(
        "dither parameter is not supported on React Native Web for MakeShader"
      );
    }
    if (cropRect) {
      console.warn(
        "cropRect is not supported on React Native Web for MakeShader"
      );
    }
    const filter = this.CanvasKit.ImageFilter.MakeShader(
      JsiSkImageFilter.fromValue(shader)
    );
    return new JsiSkImageFilter(this.CanvasKit, filter);
  }

  MakeBlur(
    sigmaX: number,
    sigmaY: number,
    mode: TileMode,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ) {
    if (cropRect) {
      console.warn(
        "cropRect is not supported on React Native Web for MakeBlur"
      );
    }
    return new JsiSkImageFilter(
      this.CanvasKit,
      this.CanvasKit.ImageFilter.MakeBlur(
        sigmaX,
        sigmaY,
        getEnum(this.CanvasKit, "TileMode", mode),
        input === null || input === undefined
          ? null
          : JsiSkImageFilter.fromValue(input)
      )
    );
  }

  MakeColorFilter(
    colorFilter: SkColorFilter,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ) {
    if (cropRect) {
      console.warn(
        "cropRect is not supported on React Native Web for MakeColorFilter"
      );
    }
    return new JsiSkImageFilter(
      this.CanvasKit,
      this.CanvasKit.ImageFilter.MakeColorFilter(
        JsiSkColorFilter.fromValue(colorFilter),
        input === null || input === undefined
          ? null
          : JsiSkImageFilter.fromValue(input)
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
    dx: number,
    dy: number,
    sigmaX: number,
    sigmaY: number,
    color: SkColor,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ): SkImageFilter {
    const inputFilter =
      input === null || input === undefined
        ? null
        : JsiSkImageFilter.fromValue<ImageFilter>(input);
    if (cropRect) {
      console.warn(
        "cropRect is not supported on React Native Web for MakeDropShadow"
      );
    }
    const filter = this.CanvasKit.ImageFilter.MakeDropShadow(
      dx,
      dy,
      sigmaX,
      sigmaY,
      color,
      inputFilter
    );
    return new JsiSkImageFilter(this.CanvasKit, filter);
  }

  MakeDropShadowOnly(
    dx: number,
    dy: number,
    sigmaX: number,
    sigmaY: number,
    color: SkColor,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ): SkImageFilter {
    const inputFilter =
      input === null || input === undefined
        ? null
        : JsiSkImageFilter.fromValue<ImageFilter>(input);
    if (cropRect) {
      console.warn(
        "cropRect is not supported on React Native Web for MakeDropShadowOnly"
      );
    }
    const filter = this.CanvasKit.ImageFilter.MakeDropShadowOnly(
      dx,
      dy,
      sigmaX,
      sigmaY,
      color,
      inputFilter
    );
    return new JsiSkImageFilter(this.CanvasKit, filter);
  }

  MakeErode(
    rx: number,
    ry: number,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ): SkImageFilter {
    const inputFilter =
      input === null || input === undefined
        ? null
        : JsiSkImageFilter.fromValue<ImageFilter>(input);
    if (cropRect) {
      console.warn(
        "cropRect is not supported on React Native Web for MakeErode"
      );
    }
    const filter = this.CanvasKit.ImageFilter.MakeErode(rx, ry, inputFilter);
    return new JsiSkImageFilter(this.CanvasKit, filter);
  }

  MakeDilate(
    rx: number,
    ry: number,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ): SkImageFilter {
    const inputFilter =
      input === null || input === undefined
        ? null
        : JsiSkImageFilter.fromValue<ImageFilter>(input);
    if (cropRect) {
      console.warn(
        "cropRect is not supported on React Native Web for MakeDilate"
      );
    }
    const filter = this.CanvasKit.ImageFilter.MakeDilate(rx, ry, inputFilter);
    return new JsiSkImageFilter(this.CanvasKit, filter);
  }

  MakeBlend(
    mode: BlendMode,
    background: SkImageFilter,
    foreground?: SkImageFilter | null,
    cropRect?: SkRect | null
  ): SkImageFilter {
    const inputFilter =
      foreground === null || foreground === undefined
        ? null
        : JsiSkImageFilter.fromValue<ImageFilter>(foreground);
    if (cropRect) {
      console.warn(
        "cropRect is not supported on React Native Web for MakeBlend"
      );
    }
    const filter = this.CanvasKit.ImageFilter.MakeBlend(
      getEnum(this.CanvasKit, "BlendMode", mode),
      JsiSkImageFilter.fromValue(background),
      inputFilter
    );
    return new JsiSkImageFilter(this.CanvasKit, filter);
  }

  MakeRuntimeShader(
    _builder: SkRuntimeShaderBuilder,
    _childShaderName: string | null,
    _input?: SkImageFilter | null
  ) {
    return throwNotImplementedOnRNWeb<SkImageFilter>();
  }
}
