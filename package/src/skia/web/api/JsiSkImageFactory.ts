import type { CanvasKit } from "canvaskit-wasm";

import type { Data, ImageInfo } from "../../types";
import type { ImageFactory } from "../../types/Image/ImageFactory";

import { Host, toValue, ckEnum } from "./Host";
import { JsiSkImage } from "./JsiSkImage";

export class JsiSkImageFactory extends Host implements ImageFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  MakeImageFromEncoded(encoded: Data) {
    const image = this.CanvasKit.MakeImageFromEncoded(toValue(encoded));
    if (image === null) {
      return null;
    }
    return new JsiSkImage(this.CanvasKit, image);
  }

  MakeImage(info: ImageInfo, data: Data, bytesPerRow: number) {
    // see toSkImageInfo() from canvaskit
    const image = this.CanvasKit.MakeImage(
      {
        alphaType: ckEnum(info.alphaType),
        colorSpace: this.CanvasKit.ColorSpace.SRGB,
        colorType: ckEnum(info.colorType),
        height: info.height,
        width: info.width,
      },
      toValue(data),
      bytesPerRow
    );
    if (image === null) {
      return null;
    }
    return new JsiSkImage(this.CanvasKit, image);
  }
}
