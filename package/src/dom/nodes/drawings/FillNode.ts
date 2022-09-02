import type { Skia } from "../../../skia/types";
import type { DrawingContext } from "../../types";
import { NodeType } from "../../types";

import type { DrawingNodeProps } from "./DrawingNode";
import { DrawingNode } from "./DrawingNode";

export class FillNode extends DrawingNode<DrawingNodeProps> {
  constructor(Skia: Skia, props: DrawingNodeProps = {}) {
    super(Skia, NodeType.Fill, props);
  }

  onPropChange(): void {}

  draw({ canvas, paint }: DrawingContext) {
    canvas.drawPaint(paint);
  }
}
