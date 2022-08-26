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

  render(ctx: DrawingContext) {
    const paint = this.props.paint
      ? this.props.paint.concat(ctx.Skia, ctx.paint, ctx.opacity)
      : ctx.paint;
    const childCtx = { ...ctx, paint };
    this.children.forEach((child) => child.render(childCtx));
  }
}
