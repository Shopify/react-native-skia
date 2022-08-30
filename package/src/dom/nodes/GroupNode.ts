import type {
  SkMatrix,
  SkPath,
  SkPathEffect,
  SkRect,
  SkRRect,
  SkShader,
} from "../../skia/types";
import { ClipOp } from "../../skia/types";
import type { SkMaskFilter } from "../../skia/types/MaskFilter";
import type { SkColorFilter } from "../../skia/types/ColorFilter/ColorFilter";
import type { SkImageFilter } from "../../skia/types/ImageFilter/ImageFilter";
import { exhaustiveCheck } from "../../renderer/typeddash";

import type { DeclarationNode, DrawingContext } from "./Node";
import { NodeType, RenderNode } from "./Node";
import type { PaintNodeProps } from "./paint/PaintNode";
import { PaintNode } from "./paint/PaintNode";

interface GroupNodeProps {
  matrix?: SkMatrix;
  paint?: PaintNodeProps;
  clipRect?: SkRect;
  clipRRect?: SkRRect;
  invertClip?: boolean;
  clipPath?: SkPath;
}

export class GroupNode extends RenderNode<GroupNodeProps> {
  paint?: PaintNode;
  children: RenderNode<unknown>[] = [];

  constructor(props: GroupNodeProps = {}) {
    super(NodeType.Group, props);
    if (props.paint) {
      this.paint = new PaintNode(props.paint);
    }
  }

  addChild(child: RenderNode<unknown>) {
    this.children.push(child);
  }

  addEffect(
    effect:
      | DeclarationNode<unknown, SkShader>
      | DeclarationNode<unknown, SkImageFilter>
      | DeclarationNode<unknown, SkColorFilter>
      | DeclarationNode<unknown, SkMaskFilter>
      | DeclarationNode<unknown, SkPathEffect>
  ) {
    if (!this.paint) {
      this.paint = new PaintNode();
    }
    if (effect.isColorFilter()) {
      this.paint.addColorFilter(effect);
    } else if (effect.isMaskFilter()) {
      this.paint.addMaskFilter(effect);
    } else if (effect.isShader()) {
      this.paint.addShader(effect);
    } else if (effect.isImageFilter()) {
      this.paint.addImageFilter(effect);
    } else if (effect.isPathEffect()) {
      this.paint.addPathEffect(effect);
    } else {
      exhaustiveCheck(effect);
    }
  }

  render(parentCtx: DrawingContext) {
    const { invertClip, matrix, clipRect, clipRRect, clipPath } = this.props;
    const { canvas } = parentCtx;

    const paint = this.paint
      ? this.paint.concat(parentCtx.Skia, parentCtx.paint, parentCtx.opacity)
      : parentCtx.paint;

    const ctx = parentCtx.paint === paint ? parentCtx : { ...parentCtx, paint };
    const hasTransform = matrix !== undefined;
    const hasClip = clipRect !== undefined;
    const shouldSave = hasTransform || hasClip;
    const op = invertClip ? ClipOp.Difference : ClipOp.Intersect;

    if (shouldSave) {
      canvas.save();
    }

    if (matrix) {
      canvas.concat(matrix);
    }
    if (clipRect) {
      canvas.clipRect(clipRect, op, true);
    }
    if (clipRRect) {
      canvas.clipRRect(clipRRect, op, true);
    }
    if (clipPath) {
      canvas.clipPath(clipPath, op, true);
    }

    this.children.forEach((child) => child.render(ctx));

    if (shouldSave) {
      canvas.restore();
    }
  }
}
