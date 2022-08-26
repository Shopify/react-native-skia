import type { DrawingContext } from "./Node";
import { RenderNode, NodeType } from "./Node";
import type { PaintNode } from "./paint/PaintNode";

interface GroupNodeProps {
  paint?: PaintNode;
}

export class GroupNode extends RenderNode<GroupNodeProps> {
  children: RenderNode<unknown>[] = [];

  constructor(props: GroupNodeProps) {
    super(NodeType.Group, props);
  }

  addChild(child: RenderNode<unknown>) {
    this.children.push(child);
  }

  render(parentCtx: DrawingContext) {
    const paint = this.props.paint
      ? this.props.paint.concat(
          parentCtx.Skia,
          parentCtx.paint,
          parentCtx.opacity
        )
      : parentCtx.paint;

    const ctx = parentCtx.paint === paint ? parentCtx : { ...parentCtx, paint };
    this.children.forEach((child) => child.render(ctx));
  }
}
