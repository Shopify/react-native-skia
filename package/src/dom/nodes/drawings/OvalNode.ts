import type { DrawingContext } from "../Node";
import { NodeType, RenderNode } from "../Node";
import type { SkRect } from "../../../skia/types";

export interface OvalNodeProps {
  rect: SkRect;
}

export class OvalNode extends RenderNode<OvalNodeProps> {
  constructor(props: OvalNodeProps) {
    super(NodeType.Oval, props);
  }

  render({ canvas, paint }: DrawingContext) {
    const { rect } = this.props;
    canvas.drawOval(rect, paint);
  }
}
