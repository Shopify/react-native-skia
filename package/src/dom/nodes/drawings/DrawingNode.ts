import type { Skia } from "../../../skia/types";
import type {
  DrawingContext,
  DrawingNodeProps,
  Node,
  NodeType,
  RenderNode,
} from "../../types";
import { JsiPaintNode, JsiRenderNode } from "../Node";

export abstract class JsiDrawingNode<P extends DrawingNodeProps>
  extends JsiRenderNode<P>
  implements RenderNode<P>
{
  constructor(Skia: Skia, type: NodeType, props: P) {
    super(Skia, type, props);
  }

  addChild(child: Node<unknown>): void {
    if (!(child instanceof JsiPaintNode)) {
      throw new Error(`Cannot add ${child.type} to ${this.type}`);
    }
    super.addChild(child);
  }

  insertChildBefore(child: Node<unknown>, before: Node<unknown>): void {
    if (!(child instanceof JsiPaintNode)) {
      throw new Error(`Cannot add ${child.type} to ${this.type}`);
    }
    super.insertChildBefore(child, before);
  }

  renderNode(ctx: DrawingContext): void {
    if (this.props.paint) {
      this.draw({ ...ctx, paint: this.props.paint });
    } else {
      this.draw(ctx);
    }
    this.children().map((child) => {
      if (child instanceof JsiPaintNode) {
        const paint = child.get();
        this.draw({ ...ctx, paint });
      }
    });
  }

  abstract draw(ctx: DrawingContext): void;
}
