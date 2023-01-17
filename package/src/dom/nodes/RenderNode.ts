import type {
  SkMatrix,
  SkRect,
  SkRRect,
  SkPath,
  SkPaint,
} from "../../skia/types";
import {
  StrokeCap,
  StrokeJoin,
  PaintStyle,
  BlendMode,
  ClipOp,
  isRRect,
} from "../../skia/types";
import type {
  RenderNode,
  GroupProps,
  DrawingContext,
  NodeType,
  Node,
} from "../types";
import { DeclarationContext } from "../types/DeclarationContext";

import { isPathDef, processPath, processTransformProps } from "./datatypes";
import type { NodeContext } from "./Node";
import { JsiNode, JsiDeclarationNode } from "./Node";
import type { PaintContext } from "./PaintContext";
import { enumKey } from "./datatypes/Enum";

const paintProps = [
  "color",
  "strokeWidth",
  "blendMode",
  "strokeCap",
  "strokeJoin",
  "strokeMiter",
  "style",
  "antiAlias",
  "opacity",
];

interface PaintCache {
  parent: SkPaint;
  child: SkPaint;
}

export abstract class JsiRenderNode<P extends GroupProps>
  extends JsiNode<P>
  implements RenderNode<P>
{
  paintCache: PaintCache | null = null;
  matrix: SkMatrix;
  clipRect?: SkRect;
  clipRRect?: SkRRect;
  clipPath?: SkPath;

  constructor(ctx: NodeContext, type: NodeType, props: P) {
    super(ctx, type, props);
    this.matrix = this.Skia.Matrix();
    this.onPropChange();
  }

  setProps(props: P) {
    super.setProps(props);
    this.onPropChange();
    this.paintCache = null;
  }

  setProp<K extends keyof P>(key: K, value: P[K]) {
    const hasChanged = super.setProp(key, value);
    if (hasChanged) {
      this.onPropChange();
      if (paintProps.includes(key as string)) {
        this.paintCache = null;
      }
    }
    return hasChanged;
  }

  protected onPropChange() {
    this.matrix.identity();
    this.clipPath = undefined;
    this.clipRect = undefined;
    this.clipRRect = undefined;
    this.computeMatrix();
    this.computeClip();
  }

  addChild(child: Node<unknown>) {
    if (child instanceof JsiDeclarationNode) {
      child.setInvalidate(() => (this.paintCache = null));
    }
    super.addChild(child);
  }

  insertChildBefore(child: Node<unknown>, before: Node<unknown>) {
    if (child instanceof JsiDeclarationNode) {
      child.setInvalidate(() => (this.paintCache = null));
    }
    super.insertChildBefore(child, before);
  }

  private computeClip() {
    const { clip } = this.props;
    if (clip) {
      if (isPathDef(clip)) {
        this.clipPath = processPath(this.Skia, clip);
      } else if (isRRect(clip)) {
        this.clipRRect = clip;
      } else {
        this.clipRect = clip;
      }
    }
  }

  private computeMatrix() {
    processTransformProps(this.matrix, this.props);
  }

  private getPaintCtx() {
    let ctx: PaintContext | undefined;
    const {
      color,
      strokeWidth,
      blendMode,
      style,
      strokeJoin,
      strokeCap,
      strokeMiter,
      opacity,
      antiAlias,
    } = this.props;
    if (
      color !== undefined ||
      strokeWidth !== undefined ||
      blendMode !== undefined ||
      style !== undefined ||
      strokeJoin !== undefined ||
      strokeCap !== undefined ||
      strokeMiter !== undefined ||
      opacity !== undefined ||
      antiAlias !== undefined
    ) {
      ctx = { opacity: 1 };
      if (color !== undefined) {
        ctx.color = this.Skia.Color(color);
      }
      if (strokeWidth !== undefined) {
        ctx.strokeWidth = strokeWidth;
      }
      if (blendMode !== undefined) {
        ctx.blendMode = BlendMode[enumKey(blendMode)];
      }
      if (style !== undefined) {
        ctx.style = PaintStyle[enumKey(style)];
      }
      if (strokeJoin !== undefined) {
        ctx.strokeJoin = StrokeJoin[enumKey(strokeJoin)];
      }
      if (strokeCap !== undefined) {
        ctx.strokeCap = StrokeCap[enumKey(strokeCap)];
      }
      if (strokeMiter !== undefined) {
        ctx.strokeMiter = strokeMiter;
      }
      if (opacity !== undefined) {
        ctx.opacity = opacity;
      }
      if (antiAlias !== undefined) {
        ctx.antiAlias = antiAlias;
      }
    }
    const declCtx = new DeclarationContext(this.Skia);
    this._children.forEach((child) => {
      if (child instanceof JsiDeclarationNode) {
        child.decorate(declCtx);
      }
    });
    const colorFilter = declCtx.popColorFiltersAsOne();
    const imageFilter = declCtx.popImageFiltersAsOne();
    const shader = declCtx.popShader();
    const maskFilter = declCtx.popMaskFilter();
    const pathEffect = declCtx.popPathEffectsAsOne();
    if (imageFilter) {
      ctx = ctx || {};
      ctx.imageFilter = imageFilter;
    }
    if (shader) {
      ctx = ctx || {};
      ctx.shader = shader;
    }
    if (pathEffect) {
      ctx = ctx || {};
      ctx.pathEffect = pathEffect;
    }
    if (colorFilter) {
      ctx = ctx || {};
      ctx.colorFilter = colorFilter;
    }
    if (maskFilter) {
      ctx = ctx || {};
      ctx.maskFilter = maskFilter;
    }
    return ctx;
  }

  render(parentCtx: DrawingContext) {
    const { invertClip, layer, matrix, transform } = this.props;
    const { canvas } = parentCtx;

    if (
      this.paintCache === null ||
      this.paintCache.parent !== parentCtx.paint
    ) {
      const paintCtx = this.getPaintCtx();
      const child = paintCtx
        ? concatPaint(parentCtx.paint.copy(), paintCtx)
        : parentCtx.paint;
      this.paintCache = { parent: parentCtx.paint, child };
    }
    const paint = this.paintCache.child;
    // TODO: can we only recreate a new context here if needed?
    const ctx = { ...parentCtx, paint };
    const hasTransform = matrix !== undefined || transform !== undefined;
    const hasClip =
      this.clipRect !== undefined ||
      this.clipPath !== undefined ||
      this.clipRRect !== undefined;
    const shouldSave = hasTransform || hasClip || !!layer;
    const op = invertClip ? ClipOp.Difference : ClipOp.Intersect;
    if (shouldSave) {
      if (layer) {
        if (typeof layer === "boolean") {
          canvas.saveLayer();
        } else {
          canvas.saveLayer(layer);
        }
      } else {
        canvas.save();
      }
    }

    if (this.matrix) {
      canvas.concat(this.matrix);
    }
    if (this.clipRect) {
      canvas.clipRect(this.clipRect, op, true);
    } else if (this.clipRRect) {
      canvas.clipRRect(this.clipRRect, op, true);
    } else if (this.clipPath) {
      canvas.clipPath(this.clipPath, op, true);
    }

    this.renderNode(ctx);

    if (shouldSave) {
      canvas.restore();
    }
  }

  abstract renderNode(ctx: DrawingContext): void;
}

const concatPaint = (
  paint: SkPaint,
  {
    color,
    strokeWidth,
    shader,
    antiAlias,
    blendMode,
    colorFilter,
    imageFilter,
    maskFilter,
    pathEffect,
    opacity,
    strokeCap,
    strokeJoin,
    strokeMiter,
    style,
  }: PaintContext
) => {
  if (opacity !== undefined) {
    paint.setAlphaf(paint.getAlphaf() * opacity);
  }
  if (color !== undefined) {
    const currentOpacity = paint.getAlphaf();
    paint.setShader(null);
    paint.setColor(color);
    paint.setAlphaf(currentOpacity * paint.getAlphaf());
  }
  if (strokeWidth !== undefined) {
    paint.setStrokeWidth(strokeWidth);
  }
  if (shader !== undefined) {
    paint.setShader(shader);
  }
  if (antiAlias !== undefined) {
    paint.setAntiAlias(antiAlias);
  }
  if (blendMode !== undefined) {
    paint.setBlendMode(blendMode);
  }
  if (colorFilter !== undefined) {
    paint.setColorFilter(colorFilter);
  }
  if (imageFilter !== undefined) {
    paint.setImageFilter(imageFilter);
  }
  if (maskFilter !== undefined) {
    paint.setMaskFilter(maskFilter);
  }
  if (pathEffect !== undefined) {
    paint.setPathEffect(pathEffect);
  }
  if (strokeCap !== undefined) {
    paint.setStrokeCap(strokeCap);
  }
  if (strokeJoin !== undefined) {
    paint.setStrokeJoin(strokeJoin);
  }
  if (strokeMiter !== undefined) {
    paint.setStrokeMiter(strokeMiter);
  }
  if (style !== undefined) {
    paint.setStyle(style);
  }
  return paint;
};
