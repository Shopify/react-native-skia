import type { DrawingContext, DrawingNodeProps } from "../Node";
import { NodeType, DrawingNode } from "../Node";

export class FillNode extends DrawingNode<DrawingNodeProps> {
  constructor(props: DrawingNodeProps = {}) {
    super(NodeType.Fill, props);
  }

  draw({ canvas, paint }: DrawingContext) {
    canvas.drawPaint(paint);
  }
}
