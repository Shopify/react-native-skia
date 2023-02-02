import { StrokeCap, StrokeJoin, PaintStyle, BlendMode } from "../../skia/types";
import type { DeclarationNode, PaintProps } from "../types";
import { DeclarationType, NodeType } from "../types";
import type { DeclarationContext } from "../types/DeclarationContext";

import { enumKey } from "./datatypes";
import type { NodeContext } from "./Node";
import { JsiDeclarationNode } from "./Node";

export class PaintNode
  extends JsiDeclarationNode<PaintProps>
  implements DeclarationNode<PaintProps>
{
  constructor(ctx: NodeContext, props: PaintProps = {}) {
    super(ctx, DeclarationType.Paint, NodeType.Paint, props);
  }

  decorate(ctx: DeclarationContext) {
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
    const paint = this.Skia.Paint();
    if (color !== undefined) {
      paint.setColor(this.Skia.Color(color));
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
    if (opacity !== undefined) {
      paint.setAlphaf(opacity);
    }
    if (antiAlias !== undefined) {
      paint.setAntiAlias(antiAlias);
    }
    ctx.save();
    this._children.forEach((child) => {
      if (child instanceof JsiDeclarationNode) {
        child.decorate(ctx);
      }
    });
    const colorFilter = ctx.colorFilters.popAllAsOne();
    const imageFilter = ctx.imageFilters.popAllAsOne();
    const shader = ctx.shaders.pop();
    const maskFilter = ctx.maskFilters.pop();
    const pathEffect = ctx.pathEffects.popAllAsOne();
    ctx.restore();
    if (imageFilter) {
      paint.setImageFilter(imageFilter);
    }
    if (shader) {
      paint.setShader(shader);
    }
    if (pathEffect) {
      paint.setPathEffect(pathEffect);
    }
    if (colorFilter) {
      paint.setColorFilter(colorFilter);
    }
    if (maskFilter) {
      paint.setMaskFilter(maskFilter);
    }
    ctx.paints.push(paint);
  }
}
