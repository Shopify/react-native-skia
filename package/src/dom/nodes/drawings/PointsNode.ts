import type { PointMode, Skia, SkPoint } from "../../../skia/types";
import type { DrawingContext, DrawingNodeProps } from "../../types";
import { NodeType } from "../../types";

import { JsiDrawingNode } from "./DrawingNode";

export interface PointsNodeProps extends DrawingNodeProps {
  points: SkPoint[];
  mode: PointMode;
}

export class PointsNode extends JsiDrawingNode<PointsNodeProps> {
  constructor(Skia: Skia, props: PointsNodeProps) {
    super(Skia, NodeType.Points, props);
  }

  onPropChange() {}

  draw({ canvas, paint }: DrawingContext) {
    const { points, mode } = this.props;
    canvas.drawPoints(mode, points, paint);
  }
}
