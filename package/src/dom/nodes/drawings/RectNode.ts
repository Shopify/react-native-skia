import type { DrawingContext, DrawingNodeProps } from "../Node";
import { NodeType, DrawingNode } from "../Node";
import type { SkRect } from "../../../skia/types/Rect";

export interface RectNodeProps extends DrawingNodeProps {
  rect: SkRect;
}

export class RectNode extends DrawingNode<RectNodeProps> {
  constructor(props: RectNodeProps) {
    super(NodeType.Rect, props);
  }

  draw({ canvas, paint }: DrawingContext) {
    const { rect } = this.props;
    canvas.drawRect(rect, paint);
  }
}
