"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkParagraphBuilder = void 0;
var _types = require("../types");
var _Host = require("./Host");
var _JsiSkParagraph = require("./JsiSkParagraph");
var _JsiSkTextStyle = require("./JsiSkTextStyle");
var _JsiSkPaint = require("./JsiSkPaint");
class JsiSkParagraphBuilder extends _Host.HostObject {
  constructor(CanvasKit, ref) {
    super(CanvasKit, ref, "ParagraphBuilder");
  }
  addPlaceholder(width = 0, height = 0, alignment = _types.PlaceholderAlignment.Baseline, baseline = _types.TextBaseline.Alphabetic, offset = 0) {
    this.ref.addPlaceholder(width, height, {
      value: alignment
    }, {
      value: baseline
    }, offset);
    return this;
  }
  addText(text) {
    this.ref.addText(text);
    return this;
  }
  build() {
    return new _JsiSkParagraph.JsiSkParagraph(this.CanvasKit, this.ref.build());
  }
  reset() {
    this.ref.reset();
  }
  pushStyle(style, foregroundPaint, backgroundPaint) {
    const textStyle = _JsiSkTextStyle.JsiSkTextStyle.toTextStyle(style);
    if (foregroundPaint || backgroundPaint) {
      var _textStyle$color, _textStyle$background;
      // Due the canvaskit API not exposing textStyle methods,
      // we set the default paint color to black for the foreground
      // and transparent for the background
      const fg = foregroundPaint ? _JsiSkPaint.JsiSkPaint.fromValue(foregroundPaint) : this.makePaint((_textStyle$color = textStyle.color) !== null && _textStyle$color !== void 0 ? _textStyle$color : Float32Array.of(0, 0, 0, 1));
      const bg = backgroundPaint ? _JsiSkPaint.JsiSkPaint.fromValue(backgroundPaint) : this.makePaint((_textStyle$background = textStyle.backgroundColor) !== null && _textStyle$background !== void 0 ? _textStyle$background : Float32Array.of(0, 0, 0, 0));
      this.ref.pushPaintStyle(new this.CanvasKit.TextStyle(textStyle), fg, bg);
    } else {
      this.ref.pushStyle(new this.CanvasKit.TextStyle(textStyle));
    }
    return this;
  }
  pop() {
    this.ref.pop();
    return this;
  }
  dispose() {
    this.ref.delete();
  }
  makePaint(color) {
    const paint = new this.CanvasKit.Paint();
    paint.setColor(color);
    return paint;
  }
}
exports.JsiSkParagraphBuilder = JsiSkParagraphBuilder;
//# sourceMappingURL=JsiSkParagraphBuilder.js.map