import { BlendMode } from "../../../skia/types";
import type { DrawingContext, PatchProps } from "../../types";
import { NodeType } from "../../types";
import { enumKey, processColor } from "../datatypes";
import { JsiDrawingNode } from "../DrawingNode";
import type { NodeContext } from "../Node";

export class PatchNode extends JsiDrawingNode<PatchProps, null> {
  constructor(ctx: NodeContext, props: PatchProps) {
    super(ctx, NodeType.Patch, props);
  }

  deriveProps() {
    return null;
  }

  draw({ canvas, paint, opacity }: DrawingContext) {
    const { colors, blendMode, patch, texture } = this.props;
    const defaultBlendMode = colors ? BlendMode.DstOver : BlendMode.SrcOver;
    const mode = blendMode ? BlendMode[enumKey(blendMode)] : defaultBlendMode;
    canvas.drawPatch(
      // Patch requires a path with the following constraints:
      // M tl
      // C c1 c2 br
      // C c1 c2 bl
      // C c1 c2 tl (the redundant point in the last command is removed)
      [
        patch[0].pos,
        patch[0].c2,
        patch[1].c1,
        patch[1].pos,
        patch[1].c2,
        patch[2].c1,
        patch[2].pos,
        patch[2].c2,
        patch[3].c1,
        patch[3].pos,
        patch[3].c2,
        patch[0].c1,
      ],
      colors
        ? colors.map((c) => processColor(this.Skia, c, opacity))
        : undefined,
      texture,
      mode,
      paint
    );
  }
}
