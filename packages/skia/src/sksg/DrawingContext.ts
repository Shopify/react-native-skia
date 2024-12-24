"worklet";

import {
  enumKey,
  isPathDef,
  processPath,
  processTransformProps2,
} from "../dom/nodes";
import type { ClipDef, GroupProps, PaintProps } from "../dom/types";
import { DeclarationContext } from "../dom/types";
import {
  BlendMode,
  ClipOp,
  isRRect,
  PaintStyle,
  StrokeCap,
  StrokeJoin,
} from "../skia/types";
import type {
  SkPath,
  SkRect,
  SkRRect,
  SkCanvas,
  Skia,
  SkPaint,
} from "../skia/types";

const computeClip = (
  Skia: Skia,
  clip: ClipDef | undefined
):
  | undefined
  | { clipPath: SkPath }
  | { clipRect: SkRect }
  | { clipRRect: SkRRect } => {
  if (clip) {
    if (isPathDef(clip)) {
      return { clipPath: processPath(Skia, clip) };
    } else if (isRRect(clip)) {
      return { clipRRect: clip };
    } else {
      return { clipRect: clip };
    }
  }
  return undefined;
};

export class DrawingContext {
  private paints: SkPaint[];
  public declCtx: DeclarationContext;
  public Skia: Skia;
  public canvas: SkCanvas;

  constructor(Skia: Skia, canvas: SkCanvas) {
    this.Skia = Skia;
    this.canvas = canvas;
    this.paints = [Skia.Paint()];
    this.declCtx = new DeclarationContext(this.Skia);
  }

  save() {
    this.paints.push(this.paint.copy());
  }

  restore() {
    this.paints.pop();
  }

  get paint() {
    const paint = this.paints[this.paints.length - 1];
    if (!paint) {
      throw new Error("Paint is undefined");
    }
    return paint;
  }

  processPaint({
    opacity,
    color,
    strokeWidth,
    blendMode,
    style,
    strokeJoin,
    strokeCap,
    strokeMiter,
    antiAlias,
    dither,
  }: PaintProps) {
    let shouldRestore = false;
    if (
      opacity !== undefined ||
      color !== undefined ||
      strokeWidth !== undefined ||
      blendMode !== undefined ||
      style !== undefined ||
      strokeJoin !== undefined ||
      strokeCap !== undefined ||
      strokeMiter !== undefined ||
      antiAlias !== undefined ||
      dither !== undefined
    ) {
      if (!shouldRestore) {
        this.save();
        shouldRestore = true;
      }
    }
    const { paint } = this;
    if (opacity !== undefined) {
      paint.setAlphaf(paint.getAlphaf() * opacity);
    }
    if (color !== undefined) {
      const currentOpacity = paint.getAlphaf();
      paint.setShader(null);
      paint.setColor(this.Skia.Color(color));
      paint.setAlphaf(currentOpacity * paint.getAlphaf());
    }
    if (strokeWidth !== undefined) {
      paint.setStrokeWidth(strokeWidth);
    }
    if (blendMode !== undefined) {
      paint.setBlendMode(BlendMode[enumKey(blendMode)]);
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
    const colorFilter = this.declCtx.colorFilters.popAllAsOne();
    const imageFilter = this.declCtx.imageFilters.popAllAsOne();
    const shader = this.declCtx.shaders.pop();
    const maskFilter = this.declCtx.maskFilters.pop();
    const pathEffect = this.declCtx.pathEffects.popAllAsOne();
    if (colorFilter) {
      paint.setColorFilter(colorFilter);
    }
    if (imageFilter) {
      paint.setImageFilter(imageFilter);
    }
    if (shader) {
      paint.setShader(shader);
    }
    if (maskFilter) {
      paint.setMaskFilter(maskFilter);
    }
    if (pathEffect) {
      paint.setPathEffect(pathEffect);
    }
    return shouldRestore;
  }

  processMatrixAndClipping(props: GroupProps, layer?: boolean | SkPaint) {
    const hasTransform =
      props.matrix !== undefined || props.transform !== undefined;
    const clip = computeClip(this.Skia, props.clip);
    const hasClip = clip !== undefined;
    const op = props.invertClip ? ClipOp.Difference : ClipOp.Intersect;
    const m3 = processTransformProps2(this.Skia, props);
    const shouldSave = hasTransform || hasClip || !!layer;
    if (shouldSave) {
      if (layer) {
        if (typeof layer === "boolean") {
          this.canvas.saveLayer();
        } else {
          this.canvas.saveLayer(layer);
        }
      } else {
        this.canvas.save();
      }
    }

    if (m3) {
      this.canvas.concat(m3);
    }
    if (clip) {
      if ("clipRect" in clip) {
        this.canvas.clipRect(clip.clipRect, op, true);
      } else if ("clipRRect" in clip) {
        this.canvas.clipRRect(clip.clipRRect, op, true);
      } else {
        this.canvas.clipPath(clip.clipPath, op, true);
      }
    }
    return shouldSave;
  }
}
