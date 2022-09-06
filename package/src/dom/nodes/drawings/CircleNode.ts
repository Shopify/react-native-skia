import type { Skia, Vector } from "../../../skia/types";
import type { CircleProps, DrawingContext } from "../../types";
import { NodeType } from "../../types";
import { processCircle } from "../datatypes";
import { JsiDrawingNode } from "../DrawingNode";

export class CircleNode extends JsiDrawingNode<CircleProps> {
  c?: Vector;

  constructor(Skia: Skia, props: CircleProps) {
    super(Skia, NodeType.Circle, props);
    this.onPropChange();
  }

  onPropChange() {
    const { c } = processCircle(this.Skia, this.props);
    this.c = c;
  }

  draw({ canvas, paint }: DrawingContext) {
    if (this.c === undefined) {
      throw new Error("CircleNode: c is undefined");
    }
    canvas.drawCircle(this.c.x, this.c.y, this.props.r, paint);
  }
}
