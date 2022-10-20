import type { DeclarationNode, DrawingContext, Node } from "../types";
import { NodeType } from "../types";
import type { ChildrenProps } from "../types/Common";
import type { SkPaint } from "../../skia";

import { JsiRenderNode } from "./RenderNode";
import type { NodeContext } from "./Node";
import { JsiDeclarationNode } from "./Node";

const isLayer = (
  node: Node<unknown>
): node is DeclarationNode<unknown, SkPaint> =>
  node instanceof JsiDeclarationNode && node.isPaint();

export class LayerNode extends JsiRenderNode<ChildrenProps> {
  constructor(ctx: NodeContext, props: ChildrenProps) {
    super(ctx, NodeType.Layer, props);
  }

  renderNode(ctx: DrawingContext): void {
    const [layer, ...children] = this.children();
    if (isLayer(layer)) {
      const paint = layer.materialize() as SkPaint;
      ctx.canvas.saveLayer(paint);
    }
    children.map((child) => {
      if (child instanceof JsiRenderNode) {
        child.render(ctx);
      }
    });
    if (isLayer(layer)) {
      ctx.canvas.restore();
    }
  }
}
