import type { DrawingContext, GroupProps } from "../types";
import { NodeType } from "../types";

import { JsiRenderNode } from "./RenderNode";
import type { NodeContext } from "./Node";

export class GroupNode extends JsiRenderNode<GroupProps> {
  constructor(ctx: NodeContext, props: GroupProps) {
    super(ctx, NodeType.Group, props);
  }

  renderNode(ctx: DrawingContext): void {
    this.children().map((child) => {
      if (child instanceof JsiRenderNode) {
        child.render(ctx);
      }
    });
  }
}
