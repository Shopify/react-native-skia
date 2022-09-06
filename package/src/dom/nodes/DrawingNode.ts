import type { Skia } from "../../skia/types";
import type {
  DrawingContext,
  DrawingNodeProps,
  Node,
  NodeType,
  RenderNode,
} from "../types";

import { JsiDeclarationNode } from "./Node";
import { PaintNode } from "./PaintNode";
import { isSkPaint, JsiRenderNode } from "./RenderNode";

export abstract class JsiDrawingNode<P extends DrawingNodeProps, C>
  extends JsiRenderNode<P>
  implements RenderNode<P>
{
  protected derived?: C;

  constructor(Skia: Skia, type: NodeType, props: P) {
    super(Skia, type, props);
    this.derived = this.deriveProps();
  }

  setProps(props: P) {
    super.setProps(props);
    this.derived = this.deriveProps();
  }

  setProp<K extends keyof P>(name: K, value: P[K]) {
    super.setProp(name, value);
    this.derived = this.deriveProps();
  }

  addChild(child: Node<unknown>): void {
    if (!(child instanceof JsiDeclarationNode)) {
      throw new Error(`Cannot add ${child.type} to ${this.type}`);
    }
    super.addChild(child);
    this.derived = this.deriveProps();
  }

  insertChildBefore(child: Node<unknown>, before: Node<unknown>): void {
    if (!(child instanceof JsiDeclarationNode)) {
      throw new Error(`Cannot add ${child.type} to ${this.type}`);
    }
    super.insertChildBefore(child, before);
    this.derived = this.deriveProps();
  }

  renderNode(ctx: DrawingContext): void {
    if (this.props.paint && isSkPaint(this.props.paint)) {
      this.draw({ ...ctx, paint: this.props.paint });
    } else if (this.props.paint && this.props.paint.current != null) {
      this.draw({ ...ctx, paint: this.props.paint.current.get() });
    } else {
      this.draw(ctx);
    }
    this.children().map((child) => {
      if (child instanceof PaintNode) {
        const paint = child.get();
        this.draw({ ...ctx, paint });
      }
    });
  }

  protected abstract draw(ctx: DrawingContext): void;
  protected abstract deriveProps(): C;
}
