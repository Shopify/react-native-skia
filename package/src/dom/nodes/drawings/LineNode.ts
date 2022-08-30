import type { DrawingContext, DrawingNodeProps } from "../Node";
import { NodeType, DrawingNode } from "../Node";
import type { SkPoint } from "../../../skia/types";

export interface LineNodeProps extends DrawingNodeProps {
  start: SkPoint;
  end: SkPoint;
}

export class LineNode extends DrawingNode<LineNodeProps> {
  constructor(props: LineNodeProps) {
    super(NodeType.Line, props);
  }

  draw({ canvas, paint }: DrawingContext) {
    const { start, end } = this.props;
    canvas.drawLine(start.x, start.y, end.x, end.y, paint);
  }
}
