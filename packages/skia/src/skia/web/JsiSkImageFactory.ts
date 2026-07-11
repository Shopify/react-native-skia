import type { CanvasKit, Image } from "canvaskit-wasm";

import { CanvasKitWebGLBuffer, isNativeBufferWeb } from "../types";
import type {
  SkData,
  ImageInfo,
  SkImage,
  NativeBuffer,
  ImageFactory,
} from "../types";

import { Host, getEnum, throwNotImplementedOnRNWeb } from "./Host";
import { JsiSkImage } from "./JsiSkImage";
import { JsiSkData } from "./JsiSkData";
import type { JsiSkSurface } from "./JsiSkSurface";
import type { CanvasKitWebGLBufferImpl } from "./CanvasKitWebGLBufferImpl";

export class JsiSkImageFactory extends Host implements ImageFactory {
  constructor(CanvasKit: CanvasKit) {
    super(CanvasKit);
  }

  MakeNull() {
    return new JsiSkImage(this.CanvasKit, null as unknown as Image);
  }

  MakeImageFromViewTag(viewTag: number): Promise<SkImage | null> {
    const view = viewTag as unknown as HTMLElement;
    // TODO: Implement screenshot from view in React JS
    console.log(view);
    return Promise.resolve(null);
  }

  MakeImageFromNativeBuffer(
    buffer: NativeBuffer,
    surface?: JsiSkSurface,
    image?: JsiSkImage
  ) {
    if (!isNativeBufferWeb(buffer)) {
      throw new Error("Invalid NativeBuffer");
    }
    if (!surface) {
      let img: Image;
      if (
        buffer instanceof HTMLImageElement ||
        buffer instanceof HTMLVideoElement ||
        buffer instanceof ImageBitmap
      ) {
        img = this.CanvasKit.MakeLazyImageFromTextureSource(buffer);
      } else if (buffer instanceof CanvasKitWebGLBuffer) {
        img = (
          buffer as CanvasKitWebGLBuffer as CanvasKitWebGLBufferImpl
        ).toImage();
      } else {
        img = this.CanvasKit.MakeImageFromCanvasImageSource(buffer);
      }
      return new JsiSkImage(this.CanvasKit, img);
    } else if (!image) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const img = (surface as any).makeImageFromTextureSource(buffer) as Image;
      return new JsiSkImage(this.CanvasKit, img);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const img = (surface as any).updateTextureFromSource(
        image,
        buffer
      ) as Image;
      return new JsiSkImage(this.CanvasKit, img);
    }
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

  MakeImageFromEncodedScaled(
    encoded: SkData,
    targetWidth: number,
    targetHeight?: number
  ) {
    if (
      !Number.isFinite(targetWidth) ||
      targetWidth <= 0 ||
      (targetHeight !== undefined &&
        (!Number.isFinite(targetHeight) || targetHeight <= 0))
    ) {
      return null;
    }

    const image = this.CanvasKit.MakeImageFromEncoded(
      JsiSkData.fromValue(encoded)
    );
    if (image === null) {
      return null;
    }

    const width = image.width();
    const height = image.height();
    let scale = targetWidth / width;
    if (targetHeight !== undefined) {
      scale = Math.min(scale, targetHeight / height);
    }
    scale = Math.min(scale, 1);
    if (scale === 1) {
      return new JsiSkImage(this.CanvasKit, image);
    }

    const scaledWidth = Math.max(1, Math.round(width * scale));
    const scaledHeight = Math.max(1, Math.round(height * scale));
    const surface = this.CanvasKit.MakeSurface(scaledWidth, scaledHeight);
    if (surface === null) {
      image.delete();
      return null;
    }

    const canvas = surface.getCanvas();
    canvas.drawImageRectOptions(
      image,
      [0, 0, width, height],
      [0, 0, scaledWidth, scaledHeight],
      this.CanvasKit.FilterMode.Linear,
      this.CanvasKit.MipmapMode.None
    );
    surface.flush();
    const scaledImage = surface.makeImageSnapshot();
    surface.delete();

    if (scaledImage === null) {
      image.delete();
      return null;
    }
    image.delete();
    return new JsiSkImage(this.CanvasKit, scaledImage);
  }

  MakeImageFromNativeTextureUnstable() {
    return throwNotImplementedOnRNWeb<SkImage>();
  }

  MakeImage(info: ImageInfo, data: SkData, bytesPerRow: number) {
    // see toSkImageInfo() from canvaskit
    const image = this.CanvasKit.MakeImage(
      {
        alphaType: getEnum(this.CanvasKit, "AlphaType", info.alphaType),
        colorSpace: this.CanvasKit.ColorSpace.SRGB,
        colorType: getEnum(this.CanvasKit, "ColorType", info.colorType),
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

  MakeImageFromTexture(_texture: GPUTexture): SkImage {
    return throwNotImplementedOnRNWeb<SkImage>();
  }

  MakeTextureFromImage(_image: SkImage): GPUTexture {
    return throwNotImplementedOnRNWeb<GPUTexture>();
  }
}
