import type { DrawingContext } from "../types";
import { NodeType } from "../types";
import type { ChildrenProps } from "../types/Common";
import { DeclarationContext } from "../types/DeclarationContext";

import { JsiRenderNode } from "./RenderNode";
import type { NodeContext } from "./Node";
import { JsiDeclarationNode } from "./Node";

export class LayerNode extends JsiRenderNode<ChildrenProps> {
  constructor(ctx: NodeContext, props: ChildrenProps) {
    super(ctx, NodeType.Layer, props);
  }

  renderNode(ctx: DrawingContext): void {
    let hasLayer = false;
    const [layer, ...children] = this.children();
    if (layer instanceof JsiDeclarationNode) {
      const declCtx = new DeclarationContext();
      layer.decorate(declCtx);
      const paint = declCtx.popPaint();
      if (paint) {
        hasLayer = true;
        ctx.canvas.saveLayer(paint);
      }
    }
    children.map((child) => {
      if (child instanceof JsiRenderNode) {
        child.render(ctx);
      }
    });
    if (hasLayer) {
      ctx.canvas.restore();
    }
  }
}
