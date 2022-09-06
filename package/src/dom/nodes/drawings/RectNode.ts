import type { Skia } from "../../../skia/types";
import type { SkRect } from "../../../skia/types/Rect";
import type { DrawingContext, RectProps } from "../../types";
import { NodeType } from "../../types";
import { processRect } from "../datatypes";
import { JsiDrawingNode } from "../DrawingNode";

export class RectNode extends JsiDrawingNode<RectProps, SkRect> {
  constructor(Skia: Skia, props: RectProps) {
    super(Skia, NodeType.Rect, props);
  }

  deriveProps() {
    return processRect(this.Skia, this.props);
  }

  draw({ canvas, paint }: DrawingContext) {
    if (this.derived === undefined) {
      throw new Error("OvalNode: rect is undefined");
    }
    canvas.drawRect(this.derived, paint);
  }
}
