import type { DrawingContext, DrawingNodeProps } from "../Node";
import { NodeType, DrawingNode } from "../Node";
import type { SkRect } from "../../../skia/types";

export interface OvalNodeProps extends DrawingNodeProps {
  rect: SkRect;
}

export class OvalNode extends DrawingNode<OvalNodeProps> {
  constructor(props: OvalNodeProps) {
    super(NodeType.Oval, props);
  }

  draw({ canvas, paint }: DrawingContext) {
    const { rect } = this.props;
    canvas.drawOval(rect, paint);
  }
}
