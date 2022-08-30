import type { Vector } from "../../../skia/types";
import type { DrawingContext, DrawingNodeProps } from "../Node";
import { NodeType, DrawingNode } from "../Node";

export interface CircleNodeProps extends DrawingNodeProps {
  r: number;
  c: Vector;
}

export class CircleNode extends DrawingNode<CircleNodeProps> {
  constructor(props: CircleNodeProps) {
    super(NodeType.Circle, props);
  }

  draw({ canvas, paint }: DrawingContext) {
    canvas.drawCircle(this.props.c.x, this.props.c.y, this.props.r, paint);
  }
}
