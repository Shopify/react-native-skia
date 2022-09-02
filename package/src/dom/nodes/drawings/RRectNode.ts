import type { Skia, SkRRect } from "../../../skia/types";
import type { DrawingContext, DrawingNodeProps } from "../../types";
import { NodeType } from "../../types";

import { JsiDrawingNode } from "./DrawingNode";

export interface RRectNodeProps extends DrawingNodeProps {
  rect: SkRRect;
}

export class RRectNode extends JsiDrawingNode<RRectNodeProps> {
  constructor(Skia: Skia, props: RRectNodeProps) {
    super(Skia, NodeType.RRect, props);
  }

  onPropChange() {}

  draw({ canvas, paint }: DrawingContext) {
    const { rect } = this.props;
    canvas.drawRRect(rect, paint);
  }
}
