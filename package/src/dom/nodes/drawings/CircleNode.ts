import type { Skia, Vector } from "../../../skia/types";
import type { DrawingContext } from "../types";
import { NodeType } from "../types";

import type { DrawingNodeProps } from "./DrawingNode";
import { DrawingNode } from "./DrawingNode";

export interface CircleNodeProps extends DrawingNodeProps {
  r: number;
  c: Vector;
}

export class CircleNode extends DrawingNode<CircleNodeProps> {
  constructor(Skia: Skia, props: CircleNodeProps) {
    super(Skia, NodeType.Circle, props);
  }

  onPropChange() {}

  draw({ canvas, paint }: DrawingContext) {
    canvas.drawCircle(this.props.c.x, this.props.c.y, this.props.r, paint);
  }
}
