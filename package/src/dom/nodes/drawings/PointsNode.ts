import type { Skia } from "../../../skia/types";
import { PointMode } from "../../../skia/types";
import type { DrawingContext, PointsProps } from "../../types";
import { NodeType } from "../../types";
import { enumKey } from "../datatypes";
import { JsiDrawingNode } from "../DrawingNode";

export class PointsNode extends JsiDrawingNode<PointsProps, null> {
  constructor(Skia: Skia, props: PointsProps) {
    super(Skia, NodeType.Points, props);
  }

  deriveProps() {
    return null;
  }

  draw({ canvas, paint }: DrawingContext) {
    const { points, mode } = this.props;
    canvas.drawPoints(PointMode[enumKey(mode)], points, paint);
  }
}
