import type { GroupProps } from "../dom/types";
import {
  processTransform3d,
  type SkCanvas,
  type SkPaint,
  type Skia,
} from "../skia/types";

export interface PaintingContext {
  paints: SkPaint[];
  // maskFilters: SkMaskFilter[];
  // shaders: SkShader[];
  // pathEffects: SkPathEffect[];
  // imageFilters: SkImageFilter[];
  // colorFilters: SkColorFilter[];
}

export interface DrawingContext extends PaintingContext {
  Skia: Skia;
  canvas: SkCanvas;
}

export const getPaint = (ctx: DrawingContext) => {
  "worklet";
  return ctx.paints[ctx.paints.length - 1];
};

export const processContext = (ctx: DrawingContext, props: GroupProps) => {
  "worklet";
  let restore = false;
  if (props.matrix) {
    ctx.canvas.save();
    ctx.canvas.concat(props.matrix);
    restore = true;
  } else if (props.transform) {
    ctx.canvas.save();
    ctx.canvas.concat(processTransform3d(props.transform));
    restore = true;
  }
  if (props.color) {
    const paint = getPaint(ctx);
    paint.setColor(ctx.Skia.Color(props.color));
  }
  return { restore };
};
