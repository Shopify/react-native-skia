import type { Skia } from "../../../skia/types";
import type { DrawingContext, DrawingNodeProps } from "../../types";
import { NodeType } from "../../types";

import { JsiDrawingNode } from "./DrawingNode";

export class FillNode extends JsiDrawingNode<DrawingNodeProps> {
  constructor(Skia: Skia, props: DrawingNodeProps = {}) {
    super(Skia, NodeType.Fill, props);
  }

  draw({ canvas, paint }: DrawingContext) {
    canvas.drawPaint(paint);
  }
}
