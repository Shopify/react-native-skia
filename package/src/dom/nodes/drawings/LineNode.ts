import type { DrawingContext } from "../Node";
import { NodeType, RenderNode } from "../Node";
import type { SkPoint } from "../../../skia/types";

export interface LineNodeProps {
  start: SkPoint;
  end: SkPoint;
}

export class LineNode extends RenderNode<LineNodeProps> {
  constructor(props: LineNodeProps) {
    super(NodeType.Line, props);
  }

  render({ canvas, paint }: DrawingContext) {
    const { start, end } = this.props;
    canvas.drawLine(start.x, start.y, end.x, end.y, paint);
  }
}
