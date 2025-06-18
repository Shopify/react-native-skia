import { Host } from "./Host";
import { JsiSkFont } from "./JsiSkFont";
import { JsiSkTextBlob } from "./JsiSkTextBlob";
import { JsiSkRSXform } from "./JsiSkRSXform";
export class JsiSkTextBlobFactory extends Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  MakeFromText(str, font) {
    return new JsiSkTextBlob(this.CanvasKit, this.CanvasKit.TextBlob.MakeFromText(str, JsiSkFont.fromValue(font)));
  }
  MakeFromGlyphs(glyphs, font) {
    return new JsiSkTextBlob(this.CanvasKit, this.CanvasKit.TextBlob.MakeFromGlyphs(glyphs, JsiSkFont.fromValue(font)));
  }
  MakeFromRSXform(str, rsxforms, font) {
    return new JsiSkTextBlob(this.CanvasKit, this.CanvasKit.TextBlob.MakeFromRSXform(str, rsxforms.map(f => Array.from(JsiSkRSXform.fromValue(f))).flat(), JsiSkFont.fromValue(font)));
  }
  MakeFromRSXformGlyphs(glyphs, rsxforms, font) {
    const transforms = rsxforms.flatMap(s => Array.from(JsiSkRSXform.fromValue(s)));
    return new JsiSkTextBlob(this.CanvasKit, this.CanvasKit.TextBlob.MakeFromRSXformGlyphs(glyphs, transforms, JsiSkFont.fromValue(font)));
  }
}
//# sourceMappingURL=JsiSkTextBlobFactory.js.map