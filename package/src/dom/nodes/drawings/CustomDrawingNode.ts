import type { Skia } from "../../../skia/types";
import type { DrawingContext } from "../../types";
import { NodeType } from "../../types";

import type { DrawingNodeProps } from "./DrawingNode";
import { DrawingNode } from "./DrawingNode";

interface CustomDrawingNodeProps extends DrawingNodeProps {
  onDraw: (ctx: DrawingContext) => void;
}

export class CustomDrawingNode extends DrawingNode<CustomDrawingNodeProps> {
  constructor(Skia: Skia, props: CustomDrawingNodeProps) {
    super(Skia, NodeType.Drawing, props);
  }

  onPropChange() {}

  draw(ctx: DrawingContext) {
    this.props.onDraw(ctx);
  }
}
