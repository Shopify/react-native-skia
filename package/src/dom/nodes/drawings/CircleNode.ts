import type { Skia } from "../../../skia/types";
import type { CircleProps, DrawingContext } from "../../types";
import { NodeType } from "../../types";
import { processCircle } from "../datatypes";
import { JsiDrawingNode } from "../DrawingNode";

export class CircleNode extends JsiDrawingNode<CircleProps> {
  constructor(Skia: Skia, props: CircleProps) {
    super(Skia, NodeType.Circle, props);
  }

  draw({ canvas, paint }: DrawingContext) {
    const { c } = processCircle(this.Skia, this.props);
    canvas.drawCircle(c.x, c.y, this.props.r, paint);
  }
}
