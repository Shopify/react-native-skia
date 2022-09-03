import type { SkMatrix, SkRect, SkRRect, Skia } from "../../skia/types";
import { isRRect, processTransform, ClipOp } from "../../skia/types";
import { exhaustiveCheck } from "../../renderer/typeddash";
import type { SkPath } from "../../skia/types/Path/Path";
import type { DrawingContext, Effect, GroupProps, RenderNode } from "../types";
import { NodeKind, NodeType } from "../types";

import { JsiPaintNode } from "./paint/PaintNode";
import { JsiRenderNode } from "./Node";
import { isPathDef, processPath } from "./datatypes";

export class GroupNode extends JsiRenderNode<GroupProps> {
  paint?: JsiPaintNode;
  matrix?: SkMatrix;
  clipRect?: SkRect;
  clipRRect?: SkRRect;
  clipPath?: SkPath;

  children: RenderNode<unknown>[] = [];

  constructor(Skia: Skia, props: GroupProps = {}) {
    super(Skia, NodeKind.Group, NodeType.Group, props);
    this.onPropChange();
  }

  setProps(props: GroupProps): void {
    super.setProps(props);
    this.onPropChange();
  }

  private onPropChange() {
    this.matrix = undefined;
    this.clipPath = undefined;
    this.clipRect = undefined;
    this.clipRRect = undefined;
    this.paint = undefined;
    if (this.hasCustomPaint()) {
      this.paint = new JsiPaintNode(this.Skia, this.props);
    }
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

  removeChild(child: RenderNode<unknown>) {
    this.children.splice(this.children.indexOf(child), 1);
  }

  addEffect(effect: Effect) {
    if (!this.paint) {
      this.paint = new JsiPaintNode(this.Skia);
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

  removeEffect(effect: Effect) {
    if (!this.paint) {
      throw new Error("No paint to remove effect from");
    }
    if (effect.isColorFilter()) {
      this.paint.removeColorFilter();
    } else if (effect.isMaskFilter()) {
      this.paint.removeMaskFilter();
    } else if (effect.isShader()) {
      this.paint.removeShader();
    } else if (effect.isImageFilter()) {
      this.paint.removeImageFilter();
    } else if (effect.isPathEffect()) {
      this.paint.removePathEffect();
    } else {
      exhaustiveCheck(effect);
    }
  }

  render(parentCtx: DrawingContext) {
    const { invertClip } = this.props;
    const { canvas } = parentCtx;

    const opacity = this.props.opacity
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
