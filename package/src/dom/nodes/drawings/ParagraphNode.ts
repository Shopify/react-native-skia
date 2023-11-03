import type { DrawingContext, ParagraphProps } from "../../types";
import { NodeType } from "../../types";
import { JsiDrawingNode } from "../DrawingNode";
import type { NodeContext } from "../Node";

export class ParagraphNode extends JsiDrawingNode<ParagraphProps, null> {
  constructor(ctx: NodeContext, props: ParagraphProps) {
    super(ctx, NodeType.Paragraph, props);
  }

  deriveProps() {
    return null;
  }

  draw({ canvas }: DrawingContext) {
    const { paragraph } = this.props;
    // canvas.drawPar(picture);
  }
}
