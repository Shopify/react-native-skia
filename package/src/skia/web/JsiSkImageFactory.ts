import type { CanvasKit } from "canvaskit-wasm";

import {
  type SkData,
  type ImageInfo,
  type SkImage,
  type NativeBuffer,
  type ImageFactory,
  isNativeBufferWeb,
} from "../types";

import { Host, getEnum } from "./Host";
import { JsiSkImage } from "./JsiSkImage";
import { JsiSkData } from "./JsiSkData";

export class JsiSkImageFactory extends Host implements ImageFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  MakeImageFromViewTag(viewTag: number): Promise<SkImage | null> {
    const view = viewTag as unknown as HTMLElement;
    // TODO: Implement screenshot from view in React JS
    console.log(view);
    return Promise.resolve(null);
  }

  MakeImageFromNativeBuffer(buffer: NativeBuffer) {
    if (!isNativeBufferWeb(buffer)) {
      throw new Error("Invalid NativeBuffer");
    }
    // TODO: this is way way to slow
    const image = this.CanvasKit.MakeImageFromCanvasImageSource(buffer);
    return new JsiSkImage(this.CanvasKit, image);
  }

  MakeImageFromEncoded(encoded: SkData) {
    const image = this.CanvasKit.MakeImageFromEncoded(
      JsiSkData.fromValue(encoded)
    );
    if (image === null) {
      return null;
    }
    return new JsiSkImage(this.CanvasKit, image);
  }

  MakeImage(info: ImageInfo, data: SkData, bytesPerRow: number) {
    // see toSkImageInfo() from canvaskit
    const image = this.CanvasKit.MakeImage(
      {
        alphaType: getEnum(this.CanvasKit.AlphaType, info.alphaType),
        colorSpace: this.CanvasKit.ColorSpace.SRGB,
        colorType: getEnum(this.CanvasKit.ColorType, info.colorType),
        height: info.height,
        width: info.width,
      },
      JsiSkData.fromValue(data),
      bytesPerRow
    );
    if (image === null) {
      return null;
    }
    return new JsiSkImage(this.CanvasKit, image);
  }
}
