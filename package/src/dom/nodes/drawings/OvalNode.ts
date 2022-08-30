import type { DrawingContext } from "../Node";
import { NodeType } from "../Node";
import type { SkRect } from "../../../skia/types";

import type { DrawingNodeProps } from "./DrawingNode";
import { DrawingNode } from "./DrawingNode";

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
