import { Host } from "./Host";
import { JsiSkParagraphBuilder } from "./JsiSkParagraphBuilder";
import { JsiSkParagraphStyle } from "./JsiSkParagraphStyle";
import { JsiSkTypefaceFontProvider } from "./JsiSkTypefaceFontProvider";
export class JsiSkParagraphBuilderFactory extends Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  Make(paragraphStyle, typefaceProvider) {
    const style = new this.CanvasKit.ParagraphStyle(JsiSkParagraphStyle.toParagraphStyle(this.CanvasKit, paragraphStyle !== null && paragraphStyle !== void 0 ? paragraphStyle : {}));
    if (typefaceProvider === undefined) {
      throw new Error("SkTypefaceFontProvider is required on React Native Web.");
    }
    const fontCollection = this.CanvasKit.FontCollection.Make();
    fontCollection.setDefaultFontManager(JsiSkTypefaceFontProvider.fromValue(typefaceProvider));
    fontCollection.enableFontFallback();
    return new JsiSkParagraphBuilder(this.CanvasKit, this.CanvasKit.ParagraphBuilder.MakeFromFontCollection(style, fontCollection));
  }
}
//# sourceMappingURL=JsiSkParagraphBuilderFactory.js.map