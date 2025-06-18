import { enumKey, processColor } from "../../../dom/nodes";
import { BlendMode, PaintStyle, StrokeCap, StrokeJoin } from "../../../skia/types";
export const setPaintProperties = (Skia, paint, {
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
    paint.setColor(processColor(Skia, color));
    paint.setAlphaf(currentOpacity * paint.getAlphaf());
  }
  if (blendMode !== undefined) {
    paint.setBlendMode(BlendMode[enumKey(blendMode)]);
  }
  if (strokeWidth !== undefined) {
    paint.setStrokeWidth(strokeWidth);
  }
  if (style !== undefined) {
    paint.setStyle(PaintStyle[enumKey(style)]);
  }
  if (strokeJoin !== undefined) {
    paint.setStrokeJoin(StrokeJoin[enumKey(strokeJoin)]);
  }
  if (strokeCap !== undefined) {
    paint.setStrokeCap(StrokeCap[enumKey(strokeCap)]);
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
//# sourceMappingURL=Paint.js.map