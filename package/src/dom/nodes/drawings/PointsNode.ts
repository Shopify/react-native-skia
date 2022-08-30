import type { PointMode, SkPoint } from "../../../skia/types";
import type { DrawingContext } from "../Node";
import { NodeType } from "../Node";

import type { DrawingNodeProps } from "./DrawingNode";
import { DrawingNode } from "./DrawingNode";

export interface PointsNodeProps extends DrawingNodeProps {
  points: SkPoint[];
  mode: PointMode;
}

export class PointsNode extends DrawingNode<PointsNodeProps> {
  constructor(props: PointsNodeProps) {
    super(NodeType.Points, props);
  }

  draw({ canvas, paint }: DrawingContext) {
    const { points, mode } = this.props;
    canvas.drawPoints(mode, points, paint);
  }
}
