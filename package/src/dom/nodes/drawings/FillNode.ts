import type { DrawingContext } from "../Node";
import { NodeType, RenderNode } from "../Node";

export class FillNode extends RenderNode<null> {
  constructor() {
    super(NodeType.Fill, null);
  }

  render({ canvas, paint }: DrawingContext) {
    canvas.drawPaint(paint);
  }
}
