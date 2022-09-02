import type { Skia } from "../../../skia/types";
import type { SkRect } from "../../../skia/types/Rect";
import type { DrawingContext } from "../../types";
import { NodeType } from "../../types";

import type { DrawingNodeProps } from "./DrawingNode";
import { DrawingNode } from "./DrawingNode";

export interface RectNodeProps extends DrawingNodeProps {
  rect: SkRect;
}

export class RectNode extends DrawingNode<RectNodeProps> {
  constructor(Skia: Skia, props: RectNodeProps) {
    super(Skia, NodeType.Rect, props);
  }

  onPropChange() {}

  draw({ canvas, paint }: DrawingContext) {
    const { rect } = this.props;
    canvas.drawRect(rect, paint);
  }
}
