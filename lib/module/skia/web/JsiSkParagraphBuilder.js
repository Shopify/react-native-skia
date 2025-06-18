import { PlaceholderAlignment, TextBaseline } from "../types";
import { HostObject } from "./Host";
import { JsiSkParagraph } from "./JsiSkParagraph";
import { JsiSkTextStyle } from "./JsiSkTextStyle";
import { JsiSkPaint } from "./JsiSkPaint";
export class JsiSkParagraphBuilder extends HostObject {
  constructor(CanvasKit, ref) {
    super(CanvasKit, ref, "ParagraphBuilder");
  }
  addPlaceholder(width = 0, height = 0, alignment = PlaceholderAlignment.Baseline, baseline = TextBaseline.Alphabetic, offset = 0) {
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
    return new JsiSkParagraph(this.CanvasKit, this.ref.build());
  }
  reset() {
    this.ref.reset();
  }
  pushStyle(style, foregroundPaint, backgroundPaint) {
    const textStyle = JsiSkTextStyle.toTextStyle(style);
    if (foregroundPaint || backgroundPaint) {
      var _textStyle$color, _textStyle$background;
      // Due the canvaskit API not exposing textStyle methods,
      // we set the default paint color to black for the foreground
      // and transparent for the background
      const fg = foregroundPaint ? JsiSkPaint.fromValue(foregroundPaint) : this.makePaint((_textStyle$color = textStyle.color) !== null && _textStyle$color !== void 0 ? _textStyle$color : Float32Array.of(0, 0, 0, 1));
      const bg = backgroundPaint ? JsiSkPaint.fromValue(backgroundPaint) : this.makePaint((_textStyle$background = textStyle.backgroundColor) !== null && _textStyle$background !== void 0 ? _textStyle$background : Float32Array.of(0, 0, 0, 0));
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
//# sourceMappingURL=JsiSkParagraphBuilder.js.map