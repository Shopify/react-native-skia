import type { Skia } from "../../../skia/types";
import type { CustomDrawingNodeProps, DrawingContext } from "../../types";
import { NodeType } from "../../types";

import { JsiDrawingNode } from "./DrawingNode";

export class CustomDrawingNode extends JsiDrawingNode<CustomDrawingNodeProps> {
  constructor(Skia: Skia, props: CustomDrawingNodeProps) {
    super(Skia, NodeType.Drawing, props);
  }

  onPropChange() {}

  draw(ctx: DrawingContext) {
    this.props.drawing(ctx);
  }
}
