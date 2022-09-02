import type { Skia } from "../../../skia/types";
import type { DrawingContext, TextProps } from "../../types";
import { NodeType } from "../../types";

import { JsiDrawingNode } from "./DrawingNode";

export class TextNode extends JsiDrawingNode<TextProps> {
  constructor(Skia: Skia, props: TextProps) {
    super(Skia, NodeType.Text, props);
  }

  onPropChange() {}

  draw({ canvas, paint }: DrawingContext) {
    const { text, x, y, font } = this.props;
    canvas.drawText(text, x, y, paint, font);
  }
}
