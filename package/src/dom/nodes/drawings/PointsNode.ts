import type { Skia } from "../../../skia/types";
import { PointMode } from "../../../skia/types";
import type { DrawingContext, PointsProps } from "../../types";
import { NodeType } from "../../types";
import { enumKey } from "../datatypes";

import { JsiDrawingNode } from "./DrawingNode";

export class PointsNode extends JsiDrawingNode<PointsProps> {
  constructor(Skia: Skia, props: PointsProps) {
    super(Skia, NodeType.Points, props);
  }

  onPropChange() {}

  draw({ canvas, paint }: DrawingContext) {
    const { points, mode } = this.props;
    canvas.drawPoints(PointMode[enumKey(mode)], points, paint);
  }
}
