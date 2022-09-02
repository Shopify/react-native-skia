import type { PointMode, Skia, SkPoint } from "../../../skia/types";
import type { DrawingContext } from "../types";
import { NodeType } from "../types";

import type { DrawingNodeProps } from "./DrawingNode";
import { DrawingNode } from "./DrawingNode";

export interface PointsNodeProps extends DrawingNodeProps {
  points: SkPoint[];
  mode: PointMode;
}

export class PointsNode extends DrawingNode<PointsNodeProps> {
  constructor(Skia: Skia, props: PointsNodeProps) {
    super(Skia, NodeType.Points, props);
  }

  onPropChange() {}

  draw({ canvas, paint }: DrawingContext) {
    const { points, mode } = this.props;
    canvas.drawPoints(mode, points, paint);
  }
}
