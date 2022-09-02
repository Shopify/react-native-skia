import type { Skia } from "../../../skia/types";
import { JsiRenderNode } from "../Node";
import type { PaintNode } from "../paint";
import type { DrawingContext, DrawingNodeProps, NodeType } from "../../types";

export abstract class JsiDrawingNode<
  P extends DrawingNodeProps
> extends JsiRenderNode<P> {
  paints: PaintNode[] = [];

  constructor(Skia: Skia, type: NodeType, props: P) {
    super(Skia, type, props);
  }

  abstract draw(ctx: DrawingContext): void;
  protected abstract onPropChange(): void;

  setProps(props: P) {
    super.setProps(props);
    this.onPropChange();
  }

  addPaint(paintNode: PaintNode) {
    this.paints.push(paintNode);
  }

  render(ctx: DrawingContext) {
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
}
