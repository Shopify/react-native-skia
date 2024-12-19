import type { CanvasKit, Image, ImageFilter } from "canvaskit-wasm";

import type {
  SkMatrix,
  type ColorChannel,
  type ImageFilterFactory,
  type SkColor,
  type SkColorFilter,
  type SkImageFilter,
  type BlendMode,
  type SkRect,
  type SkRuntimeShaderBuilder,
  type SkShader,
  type TileMode,
  type SkImage,
  type FilterMode,
  type MipmapMode,
} from "../types";

import { Host, NotImplementedOnRNWeb, getEnum } from "./Host";
import { JsiSkImageFilter } from "./JsiSkImageFilter";
import { JsiSkColorFilter } from "./JsiSkColorFilter";
import { JsiSkImage } from "./JsiSkImage";
import { JsiSkRect } from "./JsiSkRect";

export class JsiSkImageFilterFactory
  extends Host
  implements ImageFilterFactory
{
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  MakeArithmetic(): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }

  MakeBlend(
    mode: BlendMode,
    background: SkImageFilter,
    foreground?: SkImageFilter | null,
    cropRect?: SkRect | null
  ): SkImageFilter {
    const inputFilter =
      foreground == null
        ? null
        : JsiSkImageFilter.fromValue<ImageFilter>(foreground);
    if (cropRect) {
      throw new NotImplementedOnRNWeb(
        "The cropRect argument is not yet supported on React Native Web."
      );
    }
    const filter = this.CanvasKit.ImageFilter.MakeBlend(
      getEnum(this.CanvasKit.BlendMode, mode),
      JsiSkImageFilter.fromValue(background),
      inputFilter
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
      throw new NotImplementedOnRNWeb(
        "The cropRect argument is not yet supported on React Native Web."
      );
    }
    return new JsiSkImageFilter(
      this.CanvasKit,
      this.CanvasKit.ImageFilter.MakeBlur(
        sigmaX,
        sigmaY,
        getEnum(this.CanvasKit.TileMode, mode),
        input == null ? null : JsiSkImageFilter.fromValue(input)
      )
    );
  }

  MakeColorFilter(
    cf: SkColorFilter,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ) {
    if (cropRect) {
      throw new NotImplementedOnRNWeb(
        "The cropRect argument is not yet supported on React Native Web."
      );
    }
    return new JsiSkImageFilter(
      this.CanvasKit,
      this.CanvasKit.ImageFilter.MakeColorFilter(
        JsiSkColorFilter.fromValue(cf),
        input == null ? null : JsiSkImageFilter.fromValue(input)
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

  MakeCrop(): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }

  MakeDisplacementMap(
    channelX: ColorChannel,
    channelY: ColorChannel,
    scale: number,
    in1: SkImageFilter,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ): SkImageFilter {
    if (cropRect) {
      throw new NotImplementedOnRNWeb(
        "The cropRect argument is not yet supported on React Native Web."
      );
    }
    const inputFilter =
      input == null ? null : JsiSkImageFilter.fromValue<ImageFilter>(input);
    const filter = this.CanvasKit.ImageFilter.MakeDisplacementMap(
      getEnum(this.CanvasKit.ColorChannel, channelX),
      getEnum(this.CanvasKit.ColorChannel, channelY),
      scale,
      JsiSkImageFilter.fromValue(in1),
      inputFilter
    );
    return new JsiSkImageFilter(this.CanvasKit, filter);
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
      input == null ? null : JsiSkImageFilter.fromValue<ImageFilter>(input);
    if (cropRect) {
      throw new NotImplementedOnRNWeb(
        "The cropRect argument is not yet supported on React Native Web."
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
      input == null ? null : JsiSkImageFilter.fromValue<ImageFilter>(input);
    if (cropRect) {
      throw new NotImplementedOnRNWeb(
        "The cropRect argument is not yet supported on React Native Web."
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

  MakeEmpty(): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }

  MakeImage(
    image: SkImage,
    srcRect?: SkRect | null,
    dstRect?: SkRect | null,
    filterMode?: FilterMode,
    mipmap?: MipmapMode
  ): SkImageFilter {
    const skImage = JsiSkImage.fromValue<Image>(image);
    const sampling = {
      filter: filterMode
        ? getEnum(this.CanvasKit.FilterMode, filterMode)
        : this.CanvasKit.FilterMode.Nearest,
      mipmap: mipmap
        ? getEnum(this.CanvasKit.MipmapMode, mipmap)
        : this.CanvasKit.MipmapMode.None,
    };
    let filter: ImageFilter | null;
    if (srcRect) {
      if (!dstRect) {
        dstRect = srcRect;
      }
      filter = this.CanvasKit.ImageFilter.MakeImage(
        skImage,
        sampling,
        JsiSkRect.fromValue(this.CanvasKit, srcRect),
        JsiSkRect.fromValue(this.CanvasKit, dstRect)
      );
    } else {
      filter = this.CanvasKit.ImageFilter.MakeImage(skImage, sampling);
    }
    if (!filter) {
      throw new Error("Failed to create image filter");
    }
    return new JsiSkImageFilter(this.CanvasKit, filter);
  }

  MakeMagnifier(): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }

  MakeMatrixConvolution(): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }

  MakeMatrixTransform(
    matrix: SkMatrix,
    filterMode?: FilterMode,
    mipmap?: MipmapMode,
    input?: SkImageFilter | null
  ): SkImageFilter {
    const sampling = {
      filter: filterMode
        ? getEnum(this.CanvasKit.FilterMode, filterMode)
        : this.CanvasKit.FilterMode.Nearest,
      mipmap: mipmap
        ? getEnum(this.CanvasKit.MipmapMode, mipmap)
        : this.CanvasKit.MipmapMode.None,
    };
    const inputFilter =
      input == null ? null : JsiSkImageFilter.fromValue<ImageFilter>(input);
    const filter = this.CanvasKit.ImageFilter.MakeMatrixTransform(
      matrix.get(),
      sampling,
      inputFilter
    );
    return new JsiSkImageFilter(this.CanvasKit, filter);
  }

  MakeMerge(): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }

  MakeOffset(dx: number, dy: number, input: SkImageFilter | null) {
    const inputFilter =
      input === null ? null : JsiSkImageFilter.fromValue<ImageFilter>(input);
    const filter = this.CanvasKit.ImageFilter.MakeOffset(dx, dy, inputFilter);
    return new JsiSkImageFilter(this.CanvasKit, filter);
  }

  MakePicture(): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }

  MakeRuntimeShader(
    _builder: SkRuntimeShaderBuilder,
    _childShaderName: string | null,
    _input: SkImageFilter | null
  ): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }

  MakeRuntimeShaderWithChildren(): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }

  MakeShader(
    shader: SkShader,
    dither?: boolean,
    cropRect?: SkRect | null
  ): SkImageFilter {
    if (cropRect) {
      throw new NotImplementedOnRNWeb(
        "The cropRect argument is not yet supported on React Native Web."
      );
    }
    if (dither != null) {
      throw new NotImplementedOnRNWeb(
        "The dither argument is not yet supported on React Native Web."
      );
    }
    const filter = this.CanvasKit.ImageFilter.MakeShader(
      JsiSkImageFilter.fromValue(shader)
    );
    return new JsiSkImageFilter(this.CanvasKit, filter);
  }

  MakeTile(): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }

  MakeDilate(
    rx: number,
    ry: number,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ): SkImageFilter {
    const inputFilter =
      input == null ? null : JsiSkImageFilter.fromValue<ImageFilter>(input);
    if (cropRect) {
      throw new NotImplementedOnRNWeb(
        "The cropRect argument is not yet supported on React Native Web."
      );
    }
    const filter = this.CanvasKit.ImageFilter.MakeDilate(rx, ry, inputFilter);
    return new JsiSkImageFilter(this.CanvasKit, filter);
  }

  MakeErode(
    rx: number,
    ry: number,
    input?: SkImageFilter | null,
    cropRect?: SkRect | null
  ): SkImageFilter {
    const inputFilter =
      input == null ? null : JsiSkImageFilter.fromValue<ImageFilter>(input);
    if (cropRect) {
      throw new NotImplementedOnRNWeb(
        "The cropRect argument is not yet supported on React Native Web."
      );
    }
    const filter = this.CanvasKit.ImageFilter.MakeErode(rx, ry, inputFilter);
    return new JsiSkImageFilter(this.CanvasKit, filter);
  }

  MakeDistantLitDiffuse(): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }

  MakePointLitDiffuse(): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }

  MakeSpotLitDiffuse(): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }

  MakeDistantLitSpecular(): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }

  MakePointLitSpecular(): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }

  MakeSpotLitSpecular(): SkImageFilter {
    throw new NotImplementedOnRNWeb();
  }
}
