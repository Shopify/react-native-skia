import type { DrawingContext, DrawingNodeProps } from "../Node";
import { NodeType, DrawingNode } from "../Node";
import type { SkRRect } from "../../../skia/types";

export interface RRectNodeProps extends DrawingNodeProps {
  rect: SkRRect;
}

export class RRectNode extends DrawingNode<RRectNodeProps> {
  constructor(props: RRectNodeProps) {
    super(NodeType.RRect, props);
  }

  draw({ canvas, paint }: DrawingContext) {
    const { rect } = this.props;
    canvas.drawRRect(rect, paint);
  }
}
