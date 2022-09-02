import type { Skia, SkMaskFilter } from "../../../skia/types";
import { BlurStyle } from "../../../skia/types";
import { JsiDeclarationNode } from "../Node";
import type { BlurMaskFilterProps } from "../../types";
import { DeclarationType, NodeType } from "../../types";
import { enumKey } from "../datatypes";

export class BlurMaskFilterNode extends JsiDeclarationNode<
  BlurMaskFilterProps,
  SkMaskFilter
> {
  constructor(Skia: Skia, props: BlurMaskFilterProps) {
    super(Skia, DeclarationType.MaskFilter, NodeType.BlurMaskFilter, props);
  }

  get() {
    const { style, blur, respectCTM } = this.props;
    return this.Skia.MaskFilter.MakeBlur(
      BlurStyle[enumKey(style)],
      blur,
      respectCTM
    );
  }
}
