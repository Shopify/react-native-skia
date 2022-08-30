import type { DrawingContext } from "../Node";
import { NodeType } from "../Node";

import type { DrawingNodeProps } from "./DrawingNode";
import { DrawingNode } from "./DrawingNode";

export class FillNode extends DrawingNode<DrawingNodeProps> {
  constructor(props: DrawingNodeProps = {}) {
    super(NodeType.Fill, props);
  }

  draw({ canvas, paint }: DrawingContext) {
    canvas.drawPaint(paint);
  }
}
