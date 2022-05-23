import type { CanvasKit, Image } from "canvaskit-wasm";

import { ImageFormat } from "../../Image";
import type { FilterMode, MipmapMode, SkImage } from "../../Image";
import type { TileMode } from "../../ImageFilter";
import type { SkMatrix } from "../../Matrix";
import type { SkShader } from "../../Shader";

import { HostObject, optEnum } from "./Host";

export class JsiSkImage extends HostObject<Image, "Image"> implements SkImage {
  constructor(CanvasKit: CanvasKit, ref: Image) {
    super(CanvasKit, ref, "Image");
  }

  height() {
    return this.ref.height();
  }

  width() {
    return this.ref.width();
  }

  makeShaderOptions(
    _tx: TileMode,
    _ty: TileMode,
    _fm: FilterMode,
    _mm: MipmapMode,
    _localMatrix?: SkMatrix
  ): SkShader {
    throw new Error("Not implemented yet");
  }

  makeShaderCubic(
    _tx: TileMode,
    _ty: TileMode,
    _B: number,
    _C: number,
    _localMatrix?: SkMatrix
  ): SkShader {
    throw new Error("Not implemented yet");
  }

  encodeToBytes(_fmt?: ImageFormat, quality?: number): Uint8Array {
    const result = this.ref.encodeToBytes(optEnum(ImageFormat.PNG), quality);
    if (!result) {
      throw new Error("encodeToBytes failed");
    }
    return result;
  }

  encodeToBase64(_fmt?: ImageFormat, _quality?: number): string {
    throw new Error("Not implemented yet");
  }
}
