import type { PointMode, SkPoint } from "../../../skia/types";
import type { DrawingContext } from "../Node";
import { NodeType, RenderNode } from "../Node";

export interface PointsNodeProps {
  points: SkPoint[];
  mode: PointMode;
}

export class PointsNode extends RenderNode<PointsNodeProps> {
  constructor(props: PointsNodeProps) {
    super(NodeType.Points, props);
  }

  render({ canvas, paint }: DrawingContext) {
    const { points, mode } = this.props;
    canvas.drawPoints(mode, points, paint);
  }
}
