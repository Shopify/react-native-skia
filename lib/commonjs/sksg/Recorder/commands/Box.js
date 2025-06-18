"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isBoxCommand = exports.drawBox = void 0;
var _nodes = require("../../../dom/nodes");
var _types = require("../../../skia/types");
var _Core = require("../Core");
const isBoxCommand = command => {
  "worklet";

  return command.type === _Core.CommandType.DrawBox;
};
exports.isBoxCommand = isBoxCommand;
const drawBox = (ctx, command) => {
  "worklet";

  const shadows = command.shadows.map(shadow => {
    return (0, _Core.materializeCommand)(shadow).props;
  });
  const {
    paint,
    Skia,
    canvas
  } = ctx;
  const {
    box: defaultBox
  } = command.props;
  const opacity = paint.getAlphaf();
  const box = (0, _types.isRRect)(defaultBox) ? defaultBox : Skia.RRectXY(defaultBox, 0, 0);
  shadows.filter(shadow => !shadow.inner).map(shadow => {
    const {
      color = "black",
      blur,
      spread = 0,
      dx = 0,
      dy = 0
    } = shadow;
    const lPaint = Skia.Paint();
    lPaint.setColor((0, _nodes.processColor)(Skia, color));
    lPaint.setAlphaf(lPaint.getAlphaf() * opacity);
    lPaint.setMaskFilter(Skia.MaskFilter.MakeBlur(_types.BlurStyle.Normal, blur, true));
    canvas.drawRRect((0, _nodes.inflate)(Skia, box, spread, spread, dx, dy), lPaint);
  });
  canvas.drawRRect(box, paint);
  shadows.filter(shadow => shadow.inner).map(shadow => {
    const {
      color = "black",
      blur,
      spread = 0,
      dx = 0,
      dy = 0
    } = shadow;
    const delta = Skia.Point(10 + Math.abs(dx), 10 + Math.abs(dy));
    canvas.save();
    canvas.clipRRect(box, _types.ClipOp.Intersect, false);
    const lPaint = Skia.Paint();
    lPaint.setColor(Skia.Color(color));
    lPaint.setAlphaf(lPaint.getAlphaf() * opacity);
    lPaint.setMaskFilter(Skia.MaskFilter.MakeBlur(_types.BlurStyle.Normal, blur, true));
    const inner = (0, _nodes.deflate)(Skia, box, spread, spread, dx, dy);
    const outer = (0, _nodes.inflate)(Skia, box, delta.x, delta.y);
    canvas.drawDRRect(outer, inner, lPaint);
    canvas.restore();
  });
};
exports.drawBox = drawBox;
//# sourceMappingURL=Box.js.map