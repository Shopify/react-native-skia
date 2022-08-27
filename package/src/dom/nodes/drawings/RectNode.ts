import type { DrawingContext } from "../Node";
import { NodeType, RenderNode } from "../Node";
import type { SkRect } from "../../../skia/types/Rect";

export interface RectNodeProps {
  rect: SkRect;
}

export class RectNode extends RenderNode<RectNodeProps> {
  constructor(props: RectNodeProps) {
    super(NodeType.Rect, props);
  }

  render({ canvas, paint }: DrawingContext) {
    const { rect } = this.props;
    canvas.drawRect(rect, paint);
  }
}
