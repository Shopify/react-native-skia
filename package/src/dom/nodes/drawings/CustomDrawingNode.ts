import type { Skia } from "../../../skia/types";
import type { CustomDrawingNodeProps, DrawingContext } from "../../types";
import { NodeType } from "../../types";
import { JsiDrawingNode } from "../DrawingNode";

export class CustomDrawingNode extends JsiDrawingNode<
  CustomDrawingNodeProps,
  null
> {
  constructor(Skia: Skia, props: CustomDrawingNodeProps) {
    super(Skia, NodeType.Drawing, props);
  }

  deriveProps() {
    return null;
  }

  draw(ctx: DrawingContext) {
    this.props.drawing(ctx);
  }
}
