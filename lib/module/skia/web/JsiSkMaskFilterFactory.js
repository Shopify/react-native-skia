import { Host, getEnum } from "./Host";
import { JsiSkMaskFilter } from "./JsiSkMaskFilter";
export class JsiSkMaskFilterFactory extends Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  MakeBlur(style, sigma, respectCTM) {
    return new JsiSkMaskFilter(this.CanvasKit, this.CanvasKit.MaskFilter.MakeBlur(getEnum(this.CanvasKit, "BlurStyle", style), sigma, respectCTM));
  }
}
//# sourceMappingURL=JsiSkMaskFilterFactory.js.map