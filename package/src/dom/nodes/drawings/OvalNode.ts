import type { Skia, SkRect } from "../../../skia/types";
import type { DrawingContext, OvalProps } from "../../types";
import { NodeType } from "../../types";
import { processRect } from "../datatypes";
import { JsiDrawingNode } from "../DrawingNode";

export class OvalNode extends JsiDrawingNode<OvalProps, SkRect> {
  constructor(Skia: Skia, props: OvalProps) {
    super(Skia, NodeType.Oval, props);
  }

  deriveProps() {
    return processRect(this.Skia, this.props);
  }

  draw({ canvas, paint }: DrawingContext) {
    if (this.derived === undefined) {
      throw new Error("OvalNode: rect is undefined");
    }
    canvas.drawOval(this.derived, paint);
  }
}
