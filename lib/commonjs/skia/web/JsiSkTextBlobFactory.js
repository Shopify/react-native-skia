"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkTextBlobFactory = void 0;
var _Host = require("./Host");
var _JsiSkFont = require("./JsiSkFont");
var _JsiSkTextBlob = require("./JsiSkTextBlob");
var _JsiSkRSXform = require("./JsiSkRSXform");
class JsiSkTextBlobFactory extends _Host.Host {
  constructor(CanvasKit) {
    super(CanvasKit);
  }
  MakeFromText(str, font) {
    return new _JsiSkTextBlob.JsiSkTextBlob(this.CanvasKit, this.CanvasKit.TextBlob.MakeFromText(str, _JsiSkFont.JsiSkFont.fromValue(font)));
  }
  MakeFromGlyphs(glyphs, font) {
    return new _JsiSkTextBlob.JsiSkTextBlob(this.CanvasKit, this.CanvasKit.TextBlob.MakeFromGlyphs(glyphs, _JsiSkFont.JsiSkFont.fromValue(font)));
  }
  MakeFromRSXform(str, rsxforms, font) {
    return new _JsiSkTextBlob.JsiSkTextBlob(this.CanvasKit, this.CanvasKit.TextBlob.MakeFromRSXform(str, rsxforms.map(f => Array.from(_JsiSkRSXform.JsiSkRSXform.fromValue(f))).flat(), _JsiSkFont.JsiSkFont.fromValue(font)));
  }
  MakeFromRSXformGlyphs(glyphs, rsxforms, font) {
    const transforms = rsxforms.flatMap(s => Array.from(_JsiSkRSXform.JsiSkRSXform.fromValue(s)));
    return new _JsiSkTextBlob.JsiSkTextBlob(this.CanvasKit, this.CanvasKit.TextBlob.MakeFromRSXformGlyphs(glyphs, transforms, _JsiSkFont.JsiSkFont.fromValue(font)));
  }
}
exports.JsiSkTextBlobFactory = JsiSkTextBlobFactory;
//# sourceMappingURL=JsiSkTextBlobFactory.js.map