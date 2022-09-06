import type { Skia } from "../../../skia/types";
import type { DrawingContext, LineProps } from "../../types";
import { NodeType } from "../../types";
import { JsiDrawingNode } from "../DrawingNode";

export class LineNode extends JsiDrawingNode<LineProps> {
  constructor(Skia: Skia, props: LineProps) {
    super(Skia, NodeType.Line, props);
  }

  onPropChange() {}

  draw({ canvas, paint }: DrawingContext) {
    const { p1, p2 } = this.props;
    canvas.drawLine(p1.x, p1.y, p2.x, p2.y, paint);
  }
}
