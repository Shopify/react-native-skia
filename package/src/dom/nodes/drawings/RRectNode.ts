import type { DrawingContext } from "../Node";
import { NodeType, RenderNode } from "../Node";
import type { SkRRect } from "../../../skia/types";

export interface RRectNodeProps {
  rect: SkRRect;
}

export class RRectNode extends RenderNode<RRectNodeProps> {
  constructor(props: RRectNodeProps) {
    super(NodeType.RRect, props);
  }

  render({ canvas, paint }: DrawingContext) {
    const { rect } = this.props;
    canvas.drawRRect(rect, paint);
  }
}
