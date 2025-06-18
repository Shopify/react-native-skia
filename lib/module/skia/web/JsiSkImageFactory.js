import { CanvasKitWebGLBuffer, isNativeBufferWeb } from "../types";
import { Host, getEnum, throwNotImplementedOnRNWeb } from "./Host";
import { JsiSkImage } from "./JsiSkImage";
import { JsiSkData } from "./JsiSkData";
export class JsiSkImageFactory extends Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  MakeImageFromViewTag(viewTag) {
    const view = viewTag;
    // TODO: Implement screenshot from view in React JS
    console.log(view);
    return Promise.resolve(null);
  }
  MakeImageFromNativeBuffer(buffer, surface, image) {
    if (!isNativeBufferWeb(buffer)) {
      throw new Error("Invalid NativeBuffer");
    }
    if (!surface) {
      let img;
      if (buffer instanceof HTMLImageElement || buffer instanceof HTMLVideoElement || buffer instanceof ImageBitmap) {
        img = this.CanvasKit.MakeLazyImageFromTextureSource(buffer);
      } else if (buffer instanceof CanvasKitWebGLBuffer) {
        img = buffer.toImage();
      } else {
        img = this.CanvasKit.MakeImageFromCanvasImageSource(buffer);
      }
      return new JsiSkImage(this.CanvasKit, img);
    } else if (!image) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const img = surface.makeImageFromTextureSource(buffer);
      return new JsiSkImage(this.CanvasKit, img);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const img = surface.updateTextureFromSource(image, buffer);
      return new JsiSkImage(this.CanvasKit, img);
    }
  }
  MakeImageFromEncoded(encoded) {
    const image = this.CanvasKit.MakeImageFromEncoded(JsiSkData.fromValue(encoded));
    if (image === null) {
      return null;
    }
    return new JsiSkImage(this.CanvasKit, image);
  }
  MakeImageFromNativeTextureUnstable() {
    return throwNotImplementedOnRNWeb();
  }
  MakeImage(info, data, bytesPerRow) {
    // see toSkImageInfo() from canvaskit
    const image = this.CanvasKit.MakeImage({
      alphaType: getEnum(this.CanvasKit, "AlphaType", info.alphaType),
      colorSpace: this.CanvasKit.ColorSpace.SRGB,
      colorType: getEnum(this.CanvasKit, "ColorType", info.colorType),
      height: info.height,
      width: info.width
    }, JsiSkData.fromValue(data), bytesPerRow);
    if (image === null) {
      return null;
    }
    return new JsiSkImage(this.CanvasKit, image);
  }
}
//# sourceMappingURL=JsiSkImageFactory.js.map