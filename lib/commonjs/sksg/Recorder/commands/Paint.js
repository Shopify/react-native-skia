"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setPaintProperties = void 0;
var _nodes = require("../../../dom/nodes");
var _types = require("../../../skia/types");
const setPaintProperties = (Skia, paint, {
  opacity,
  color,
  blendMode,
  strokeWidth,
  style,
  strokeJoin,
  strokeCap,
  strokeMiter,
  antiAlias,
  dither
}) => {
  "worklet";

  if (opacity !== undefined) {
    paint.setAlphaf(paint.getAlphaf() * opacity);
  }
  if (color !== undefined) {
    const currentOpacity = paint.getAlphaf();
    paint.setShader(null);
    paint.setColor((0, _nodes.processColor)(Skia, color));
    paint.setAlphaf(currentOpacity * paint.getAlphaf());
  }
  if (blendMode !== undefined) {
    paint.setBlendMode(_types.BlendMode[(0, _nodes.enumKey)(blendMode)]);
  }
  if (strokeWidth !== undefined) {
    paint.setStrokeWidth(strokeWidth);
  }
  if (style !== undefined) {
    paint.setStyle(_types.PaintStyle[(0, _nodes.enumKey)(style)]);
  }
  if (strokeJoin !== undefined) {
    paint.setStrokeJoin(_types.StrokeJoin[(0, _nodes.enumKey)(strokeJoin)]);
  }
  if (strokeCap !== undefined) {
    paint.setStrokeCap(_types.StrokeCap[(0, _nodes.enumKey)(strokeCap)]);
  }
  if (strokeMiter !== undefined) {
    paint.setStrokeMiter(strokeMiter);
  }
  if (antiAlias !== undefined) {
    paint.setAntiAlias(antiAlias);
  }
  if (dither !== undefined) {
    paint.setDither(dither);
  }
};
exports.setPaintProperties = setPaintProperties;
//# sourceMappingURL=Paint.js.map