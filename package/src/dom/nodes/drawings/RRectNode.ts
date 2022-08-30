import type { DrawingContext } from "../Node";
import { NodeType } from "../Node";
import type { SkRRect } from "../../../skia/types";

import type { DrawingNodeProps } from "./DrawingNode";
import { DrawingNode } from "./DrawingNode";

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
