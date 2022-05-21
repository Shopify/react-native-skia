import type { CanvasKit, Image } from "canvaskit-wasm";

import type { FilterMode, ImageFormat, MipmapMode, SkImage } from "../../Image";
import type { TileMode } from "../../ImageFilter";
import type { SkMatrix } from "../../Matrix";
import type { SkShader } from "../../Shader";

import { HostObject } from "./Host";

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

  encodeToBytes(_fmt?: ImageFormat, _quality?: number): Uint8Array {
    throw new Error("Not implemented yet");
  }

  encodeToBase64(_fmt?: ImageFormat, _quality?: number): string {
    throw new Error("Not implemented yet");
  }
}
