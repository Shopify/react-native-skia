import { BlurStyle } from "../../../skia/types";
import type { NodeContext } from "../Node";
import { JsiDeclarationNode } from "../Node";
import type { BlurMaskFilterProps } from "../../types";
import { NodeType } from "../../types";
import { enumKey } from "../datatypes";
import type { DeclarationContext } from "../../types/DeclarationContext";

export class BlurMaskFilterNode extends JsiDeclarationNode<BlurMaskFilterProps> {
  constructor(ctx: NodeContext, props: BlurMaskFilterProps) {
    super(ctx, NodeType.BlurMaskFilter, props);
  }

  decorate(ctx: DeclarationContext) {
    const { style, blur, respectCTM } = this.props;
    const mf = this.Skia.MaskFilter.MakeBlur(
      BlurStyle[enumKey(style)],
      blur,
      respectCTM
    );
    ctx.maskFilters.push(mf);
  }
}
