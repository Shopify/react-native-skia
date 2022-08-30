import type { BlendMode, SkColor, SkPoint } from "../../../skia/types";
import type { DrawingContext, DrawingNodeProps } from "../Node";
import { NodeType, DrawingNode } from "../Node";

export interface PatchNodeProps extends DrawingNodeProps {
  cubics: SkPoint[];
  colors?: SkColor[];
  tex?: SkPoint[];
  mode?: BlendMode;
}

export class PatchNode extends DrawingNode<PatchNodeProps> {
  constructor(props: PatchNodeProps) {
    super(NodeType.Patch, props);
  }

  draw({ canvas, paint }: DrawingContext) {
    const { cubics, colors, tex, mode } = this.props;
    canvas.drawPatch(cubics, colors, tex, mode, paint);
  }
}
