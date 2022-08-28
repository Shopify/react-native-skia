import type { DrawingContext } from "../Node";
import { NodeType, RenderNode } from "../Node";

interface DrawingNodeProps {
  onDraw: (ctx: DrawingContext) => void;
}

export class DrawingNode extends RenderNode<DrawingNodeProps> {
  constructor(props: DrawingNodeProps) {
    super(NodeType.Drawing, props);
  }

  render(ctx: DrawingContext) {
    this.props.onDraw(ctx);
  }
}
