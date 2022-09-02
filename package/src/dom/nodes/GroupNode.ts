import type {
  SkMatrix,
  SkPathEffect,
  SkRect,
  SkRRect,
  SkShader,
  Skia,
} from "../../skia/types";
import { isRRect, processTransform, ClipOp } from "../../skia/types";
import type { SkMaskFilter } from "../../skia/types/MaskFilter";
import type { SkColorFilter } from "../../skia/types/ColorFilter/ColorFilter";
import type { SkImageFilter } from "../../skia/types/ImageFilter/ImageFilter";
import { exhaustiveCheck } from "../../renderer/typeddash";
import type { SkPath } from "../../skia/types/Path/Path";
import { isPathDef, processPath } from "../../renderer/processors";

import { PaintNode } from "./paint/PaintNode";
import { JsiRenderNode } from "./Node";
import type {
  DeclarationNode,
  DrawingContext,
  GroupProps,
  RenderNode,
} from "./types";
import { NodeType } from "./types";

export class GroupNode extends JsiRenderNode<GroupProps> {
  paint?: PaintNode;
  matrix?: SkMatrix;
  clipRect?: SkRect;
  clipRRect?: SkRRect;
  clipPath?: SkPath;

  children: RenderNode<unknown>[] = [];

  constructor(Skia: Skia, props: GroupProps = {}) {
    super(Skia, NodeType.Group, props);
    if (this.hasCustomPaint()) {
      this.paint = new PaintNode(this.Skia, props);
    }
    this.onPropChange();
  }

  private onPropChange() {
    this.matrix = undefined;
    this.clipPath = undefined;
    this.clipRect = undefined;
    this.clipRRect = undefined;
    this.computeMatrix();
    this.computeClip();
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
    const { transform, origin, matrix } = this.props;
    if (matrix) {
      this.matrix = matrix;
    } else if (transform) {
      const m = this.Skia.Matrix();
      if (origin) {
        m.translate(origin.x, origin.y);
      }
      processTransform(m, transform);
      if (origin) {
        m.translate(-origin.x, -origin.y);
      }
      this.matrix = m;
    }
  }

  private hasCustomPaint() {
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
    return (
      color !== undefined ||
      strokeWidth !== undefined ||
      blendMode !== undefined ||
      style !== undefined ||
      strokeJoin !== undefined ||
      strokeCap !== undefined ||
      strokeMiter !== undefined ||
      opacity !== undefined ||
      antiAlias !== undefined
    );
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
      this.paint = new PaintNode(this.Skia);
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
    const { invertClip } = this.props;
    const { canvas } = parentCtx;

    const opacity =
      this.props.paint && this.props.opacity
        ? parentCtx.opacity * this.props.opacity
        : parentCtx.opacity;

    const paint = this.paint
      ? this.paint.concat(parentCtx.paint, opacity)
      : parentCtx.paint;

    // TODO: can we only recreate a new context here if needed?
    const ctx = { ...parentCtx, opacity, paint };
    const hasTransform = this.matrix !== undefined;
    const hasClip = this.clipRect !== undefined;
    const shouldSave = hasTransform || hasClip;
    const op = invertClip ? ClipOp.Difference : ClipOp.Intersect;

    if (shouldSave) {
      canvas.save();
    }

    if (this.matrix) {
      canvas.concat(this.matrix);
    }
    if (this.clipRect) {
      canvas.clipRect(this.clipRect, op, true);
    }
    if (this.clipRRect) {
      canvas.clipRRect(this.clipRRect, op, true);
    }
    if (this.clipPath) {
      canvas.clipPath(this.clipPath, op, true);
    }

    this.children.forEach((child) => child.render(ctx));

    if (shouldSave) {
      canvas.restore();
    }
  }
}
