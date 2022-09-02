import type { BlendMode, SkColor, Skia, SkPoint } from "../../../skia/types";
import type { DrawingContext } from "../types";
import { NodeType } from "../types";

import type { DrawingNodeProps } from "./DrawingNode";
import { DrawingNode } from "./DrawingNode";

export interface PatchNodeProps extends DrawingNodeProps {
  cubics: SkPoint[];
  colors?: SkColor[];
  tex?: SkPoint[];
  mode?: BlendMode;
}

export class PatchNode extends DrawingNode<PatchNodeProps> {
  constructor(Skia: Skia, props: PatchNodeProps) {
    super(Skia, NodeType.Patch, props);
  }

  onPropChange(): void {}

  draw({ canvas, paint }: DrawingContext) {
    const { cubics, colors, tex, mode } = this.props;
    canvas.drawPatch(cubics, colors, tex, mode, paint);
  }
}
