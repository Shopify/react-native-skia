import type { Skia } from "../../../skia/types";
import type { DrawingContext, DrawingNodeProps } from "../../types";
import { NodeType } from "../../types";

import { JsiDrawingNode } from "./DrawingNode";

interface CustomDrawingNodeProps extends DrawingNodeProps {
  onDraw: (ctx: DrawingContext) => void;
}

export class CustomDrawingNode extends JsiDrawingNode<CustomDrawingNodeProps> {
  constructor(Skia: Skia, props: CustomDrawingNodeProps) {
    super(Skia, NodeType.Drawing, props);
  }

  onPropChange() {}

  draw(ctx: DrawingContext) {
    this.props.onDraw(ctx);
  }
}
