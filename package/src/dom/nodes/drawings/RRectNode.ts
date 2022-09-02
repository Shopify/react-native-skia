import type { Skia, SkRRect } from "../../../skia/types";
import type { DrawingContext } from "../types";
import { NodeType } from "../types";

import type { DrawingNodeProps } from "./DrawingNode";
import { DrawingNode } from "./DrawingNode";

export interface RRectNodeProps extends DrawingNodeProps {
  rect: SkRRect;
}

export class RRectNode extends DrawingNode<RRectNodeProps> {
  constructor(Skia: Skia, props: RRectNodeProps) {
    super(Skia, NodeType.RRect, props);
  }

  onPropChange() {}

  draw({ canvas, paint }: DrawingContext) {
    const { rect } = this.props;
    canvas.drawRRect(rect, paint);
  }
}
