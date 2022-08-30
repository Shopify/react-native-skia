import type { SkPaint } from "../../../skia/types";
import type { DrawingContext, NodeType } from "../Node";
import { RenderNode } from "../Node";
import type { PaintNode } from "../paint";

export interface DrawingNodeProps {
  paint?: SkPaint;
}

export abstract class DrawingNode<
  P extends DrawingNodeProps = DrawingNodeProps
> extends RenderNode<P> {
  paints: PaintNode[] = [];

  constructor(type: NodeType, props: P) {
    super(type, props);
  }

  abstract draw(ctx: DrawingContext): void;

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
      const paint = paintNode.concat(ctx.Skia, ctx.paint, ctx.opacity);
      this.draw({ ...ctx, paint });
    });
  }
}
