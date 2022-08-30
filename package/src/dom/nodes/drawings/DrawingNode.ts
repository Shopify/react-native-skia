import type { DrawingContext, DrawingNodeProps } from "../Node";
import { NodeType, DrawingNode } from "../Node";

interface CustomDrawingNodeProps extends DrawingNodeProps {
  onDraw: (ctx: DrawingContext) => void;
}

export class CustomDrawingNode extends DrawingNode<CustomDrawingNodeProps> {
  constructor(props: CustomDrawingNodeProps) {
    super(NodeType.Drawing, props);
  }

  draw(ctx: DrawingContext) {
    this.props.onDraw(ctx);
  }
}
