import type { Skia, SkPoint } from "../../../skia/types";
import type { DrawingContext, DrawingNodeProps } from "../../types";
import { NodeType } from "../../types";

import { JsiDrawingNode } from "./DrawingNode";

export interface LineNodeProps extends DrawingNodeProps {
  start: SkPoint;
  end: SkPoint;
}

export class LineNode extends JsiDrawingNode<LineNodeProps> {
  constructor(Skia: Skia, props: LineNodeProps) {
    super(Skia, NodeType.Line, props);
  }

  onPropChange() {}

  draw({ canvas, paint }: DrawingContext) {
    const { start, end } = this.props;
    canvas.drawLine(start.x, start.y, end.x, end.y, paint);
  }
}
