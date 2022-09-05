import type { Skia } from "../../../skia/types";
import { JsiRenderNode } from "../Node";
import type { JsiPaintNode } from "../paint";
import type {
  DrawingContext,
  DrawingNodeProps,
  NodeType,
  RenderNode,
} from "../../types";
import { NodeKind } from "../../types";

export abstract class JsiDrawingNode<P extends DrawingNodeProps>
  extends JsiRenderNode<P>
  implements RenderNode<P>
{
  paints: JsiPaintNode[] = [];

  constructor(Skia: Skia, type: NodeType, props: P) {
    super(Skia, NodeKind.Drawing, type, props);
  }

  abstract draw(ctx: DrawingContext): void;
  protected abstract onPropChange(): void;

  setProps(props: P) {
    super.setProps(props);
    this.onPropChange();
  }

  setProp<K extends keyof P>(name: K, v: P[K]) {
    super.setProp(name, v);
    this.onPropChange();
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
