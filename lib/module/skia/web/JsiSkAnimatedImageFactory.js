import { Host } from "./Host";
import { JsiSkData } from "./JsiSkData";
import { JsiSkAnimatedImage } from "./JsiSkAnimatedImage";
export class JsiSkAnimatedImageFactory extends Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  MakeAnimatedImageFromEncoded(encoded) {
    const image = this.CanvasKit.MakeAnimatedImageFromEncoded(JsiSkData.fromValue(encoded));
    if (image === null) {
      return null;
    }
    return new JsiSkAnimatedImage(this.CanvasKit, image);
  }
}
//# sourceMappingURL=JsiSkAnimatedImageFactory.js.map