import type { Skia } from "../../../skia/types";
import type { DiffRectProps, DrawingContext } from "../../types";
import { NodeType } from "../../types";
import { JsiDrawingNode } from "../DrawingNode";

export class DiffRectNode extends JsiDrawingNode<DiffRectProps> {
  constructor(Skia: Skia, props: DiffRectProps) {
    super(Skia, NodeType.DiffRect, props);
  }

  onPropChange() {}

  draw({ canvas, paint }: DrawingContext) {
    const { outer, inner } = this.props;
    canvas.drawDRRect(outer, inner, paint);
  }
}
