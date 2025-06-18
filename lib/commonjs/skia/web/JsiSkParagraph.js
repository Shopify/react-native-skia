"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.JsiSkParagraph = void 0;
var _Host = require("./Host");
class JsiSkParagraph extends _Host.HostObject {
  constructor(CanvasKit, ref) {
    super(CanvasKit, ref, "Paragraph");
  }
  getMinIntrinsicWidth() {
    return this.ref.getMinIntrinsicWidth();
  }
  getMaxIntrinsicWidth() {
    return this.ref.getMaxIntrinsicWidth();
  }
  getLongestLine() {
    return this.ref.getLongestLine();
  }
  layout(width) {
    this.ref.layout(width);
  }
  paint(canvas, x, y) {
    canvas.ref.drawParagraph(this.ref, x, y);
  }
  getHeight() {
    return this.ref.getHeight();
  }
  getMaxWidth() {
    return this.ref.getMaxWidth();
  }
  getGlyphPositionAtCoordinate(x, y) {
    return this.ref.getGlyphPositionAtCoordinate(x, y).pos;
  }
  getRectsForPlaceholders() {
    return this.ref.getRectsForPlaceholders().map(({
      rect,
      dir
    }) => ({
      rect: {
        x: rect.at(0),
        y: rect.at(1),
        width: rect.at(2),
        height: rect.at(3)
      },
      direction: dir.value
    }));
  }
  getRectsForRange(start, end) {
    return this.ref.getRectsForRange(start, end, {
      value: 0
    } /** kTight */, {
      value: 0
    } /** kTight */).map(({
      rect
    }) => ({
      x: rect[0],
      y: rect[1],
      width: rect[2],
      height: rect[3]
    }));
  }
  getLineMetrics() {
    return this.ref.getLineMetrics().map((r, index) => ({
      x: r.left,
      y: index * r.height,
      width: r.width,
      height: r.height
    }));
  }
  dispose() {
    this.ref.delete();
  }
}
exports.JsiSkParagraph = JsiSkParagraph;
//# sourceMappingURL=JsiSkParagraph.js.map