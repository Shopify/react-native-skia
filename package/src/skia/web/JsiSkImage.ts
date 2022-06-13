import type { CanvasKit, Image } from "canvaskit-wasm";

import type {
  ImageFormat,
  FilterMode,
  MipmapMode,
  SkImage,
  SkMatrix,
  SkShader,
  TileMode,
} from "../types";

import { ckEnum, HostObject } from "./Host";

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

  encodeToBytes(fmt?: ImageFormat, quality?: number): Uint8Array {
    let result: Uint8Array | null;
    if (fmt && quality) {
      result = this.ref.encodeToBytes(ckEnum(fmt), quality);
    } else if (fmt) {
      result = this.ref.encodeToBytes(ckEnum(fmt));
    } else {
      result = this.ref.encodeToBytes();
    }
    if (!result) {
      throw new Error("encodeToBytes failed");
    }
    return result;
  }

  encodeToBase64(_fmt?: ImageFormat, _quality?: number): string {
    throw new Error("Not implemented yet");
  }
}
