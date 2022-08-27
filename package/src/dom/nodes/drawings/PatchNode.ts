import type { BlendMode, SkColor, SkPoint } from "../../../skia/types";
import type { DrawingContext } from "../Node";
import { NodeType, RenderNode } from "../Node";

export interface PatchNodeProps {
  cubics: SkPoint[];
  colors?: SkColor[];
  tex?: SkPoint[];
  mode?: BlendMode;
}

export class PatchNode extends RenderNode<PatchNodeProps> {
  constructor(props: PatchNodeProps) {
    super(NodeType.Patch, props);
  }

  render({ canvas, paint }: DrawingContext) {
    const { cubics, colors, tex, mode } = this.props;
    canvas.drawPatch(cubics, colors, tex, mode, paint);
  }
}
