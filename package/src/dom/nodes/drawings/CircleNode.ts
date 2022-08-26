import type { Vector } from "../../../skia/types";
import type { DrawingContext } from "../Node";
import { NodeType, RenderNode } from "../Node";

export interface CircleNodeProps {
  r: number;
  c: Vector;
}

export class CircleNode extends RenderNode<CircleNodeProps> {
  constructor(props: CircleNodeProps) {
    super(NodeType.Circle, props);
  }

  render({ canvas, paint }: DrawingContext) {
    canvas.drawCircle(this.props.c.x, this.props.c.y, this.props.r, paint);
  }
}
