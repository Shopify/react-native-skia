import { Host } from "./Host";
import { JsiSkPicture } from "./JsiSkPicture";
export class JsiSkPictureFactory extends Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  MakePicture(bytes) {
    const pic = this.CanvasKit.MakePicture(bytes);
    if (pic === null) {
      return null;
    }
    return new JsiSkPicture(this.CanvasKit, pic);
  }
}
//# sourceMappingURL=JsiSkPictureFactory.js.map