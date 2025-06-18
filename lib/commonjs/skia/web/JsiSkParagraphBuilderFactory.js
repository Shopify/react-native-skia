"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkParagraphBuilderFactory = void 0;
var _Host = require("./Host");
var _JsiSkParagraphBuilder = require("./JsiSkParagraphBuilder");
var _JsiSkParagraphStyle = require("./JsiSkParagraphStyle");
var _JsiSkTypefaceFontProvider = require("./JsiSkTypefaceFontProvider");
class JsiSkParagraphBuilderFactory extends _Host.Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  Make(paragraphStyle, typefaceProvider) {
    const style = new this.CanvasKit.ParagraphStyle(_JsiSkParagraphStyle.JsiSkParagraphStyle.toParagraphStyle(this.CanvasKit, paragraphStyle !== null && paragraphStyle !== void 0 ? paragraphStyle : {}));
    if (typefaceProvider === undefined) {
      throw new Error("SkTypefaceFontProvider is required on React Native Web.");
    }
    const fontCollection = this.CanvasKit.FontCollection.Make();
    fontCollection.setDefaultFontManager(_JsiSkTypefaceFontProvider.JsiSkTypefaceFontProvider.fromValue(typefaceProvider));
    fontCollection.enableFontFallback();
    return new _JsiSkParagraphBuilder.JsiSkParagraphBuilder(this.CanvasKit, this.CanvasKit.ParagraphBuilder.MakeFromFontCollection(style, fontCollection));
  }
}
exports.JsiSkParagraphBuilderFactory = JsiSkParagraphBuilderFactory;
//# sourceMappingURL=JsiSkParagraphBuilderFactory.js.map