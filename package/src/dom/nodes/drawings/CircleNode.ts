import type { Skia, Vector } from "../../../skia/types";
import type { DrawingContext, DrawingNodeProps } from "../../types";
import { NodeType } from "../../types";

import { JsiDrawingNode } from "./DrawingNode";

export interface CircleNodeProps extends DrawingNodeProps {
  r: number;
  c: Vector;
}

export class CircleNode extends JsiDrawingNode<CircleNodeProps> {
  constructor(Skia: Skia, props: CircleNodeProps) {
    super(Skia, NodeType.Circle, props);
  }

  onPropChange() {}

  draw({ canvas, paint }: DrawingContext) {
    canvas.drawCircle(this.props.c.x, this.props.c.y, this.props.r, paint);
  }
}
