import type { Skia } from "../../../skia/types";
import type { SkRect } from "../../../skia/types/Rect";
import type { DrawingContext, RectProps } from "../../types";
import { NodeType } from "../../types";
import { processRect } from "../datatypes";
import { JsiDrawingNode } from "../DrawingNode";

export class RectNode extends JsiDrawingNode<RectProps> {
  rect?: SkRect;

  constructor(Skia: Skia, props: RectProps) {
    super(Skia, NodeType.Rect, props);
    this.onPropChange();
  }

  onPropChange() {
    this.rect = processRect(this.Skia, this.props);
  }

  draw({ canvas, paint }: DrawingContext) {
    if (this.rect === undefined) {
      throw new Error("OvalNode: rect is undefined");
    }
    canvas.drawRect(this.rect, paint);
  }
}
