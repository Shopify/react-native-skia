import type { Skia } from "../../../skia/types";
import { ClipOp } from "../../../skia/types";
import type { JsiPaintNode } from "../paint";
import type {
  DrawingContext,
  DrawingNode,
  DrawingNodeProps,
  NodeType,
} from "../../types";
import { NodeKind } from "../../types";
import { JsiGroupNode } from "../GroupNode";

export abstract class JsiDrawingNode<P extends DrawingNodeProps>
  extends JsiGroupNode<P>
  implements DrawingNode<P>
{
  paints: JsiPaintNode[] = [];

  constructor(Skia: Skia, type: NodeType, props: P) {
    super(Skia, props, NodeKind.Drawing, type);
    this.onPropChange();
  }

  setProps(props: P) {
    super.setProps(props);
    this.onPropChange();
  }

  setProp<K extends keyof P>(name: K, v: P[K]) {
    this.props[name] = v;
    this.onPropChange();
  }

  getPaints() {
    return this.paints;
  }

  addPaint(paintNode: JsiPaintNode) {
    this.paints.push(paintNode);
  }

  insertPaintBefore(child: JsiPaintNode, before: JsiPaintNode) {
    const index = this.paints.indexOf(child);
    if (index !== -1) {
      this.paints.splice(index, 1);
    }
    const beforeIndex = this.paints.indexOf(before);
    this.paints.splice(beforeIndex, 0, child);
  }

  removePaint(paintNode: JsiPaintNode) {
    this.paints.splice(this.paints.indexOf(paintNode), 1);
  }

  abstract draw(ctx: DrawingContext): void;

  drawPaints(ctx: DrawingContext) {
    if (this.props.paint) {
      this.draw({ ...ctx, paint: this.props.paint });
    } else {
      this.draw(ctx);
    }
    this.paints.forEach((paintNode) => {
      const paint = paintNode.concat(ctx.paint, ctx.opacity);
      this.draw({ ...ctx, paint });
    });
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

    this.drawPaints(ctx);

    if (shouldSave) {
      canvas.restore();
    }
  }
}
