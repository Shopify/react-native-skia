import type { DrawingContext } from "../Node";
import { NodeType } from "../Node";
import type { SkRect } from "../../../skia/types/Rect";

import type { DrawingNodeProps } from "./DrawingNode";
import { DrawingNode } from "./DrawingNode";

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
