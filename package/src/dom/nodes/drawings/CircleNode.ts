import type { Skia, SkPoint } from "../../../skia/types";
import type { CircleProps, DrawingContext } from "../../types";
import { NodeType } from "../../types";
import { processCircle } from "../datatypes";
import { JsiDrawingNode } from "../DrawingNode";

export class CircleNode extends JsiDrawingNode<CircleProps> {
  c?: SkPoint;

  constructor(Skia: Skia, props: CircleProps) {
    super(Skia, NodeType.Circle, props);
    this.onPropChange();
  }

  setProps(props: CircleProps) {
    super.setProps(props);
    this.onPropChange();
  }

  setProp<K extends keyof CircleProps>(name: K, value: CircleProps[K]) {
    super.setProp(name, value);
    this.onPropChange();
  }

  protected onPropChange(): void {
    super.onPropChange();
    const { c } = processCircle(this.Skia, this.props);
    this.c = c;
  }

  draw({ canvas, paint }: DrawingContext) {
    if (!this.c) {
      throw new Error("CircleNode: c is undefined");
    }
    canvas.drawCircle(this.c.x, this.c.y, this.props.r, paint);
  }
}
