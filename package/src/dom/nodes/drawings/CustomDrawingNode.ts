import type { DrawingContext } from "../Node";
import { NodeType } from "../Node";

import type { DrawingNodeProps } from "./DrawingNode";
import { DrawingNode } from "./DrawingNode";

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
