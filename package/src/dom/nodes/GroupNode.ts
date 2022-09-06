import type { Skia } from "../../skia/types";
import type { DrawingContext, GroupProps } from "../types";
import { NodeType } from "../types";
import type { RenderNode } from "../types/Node";

import { JsiRenderNode } from "./RenderNode";

export class GroupNode
  extends JsiRenderNode<GroupProps>
  implements RenderNode<GroupProps>
{
  constructor(Skia: Skia, props: GroupProps) {
    super(Skia, NodeType.Group, props);
  }

  renderNode(ctx: DrawingContext): void {
    this.children().map((child) => {
      if (child instanceof JsiRenderNode) {
        child.render(ctx);
      }
    });
  }
}
