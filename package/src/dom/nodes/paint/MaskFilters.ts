import type { Skia, BlurStyle, SkMaskFilter } from "../../../skia/types";
import { JsiDeclarationNode } from "../Node";
import { DeclarationType, NodeType } from "../../types";

export interface BlurMaskFilterNodeProps {
  style: BlurStyle;
  sigma: number;
  respectCTM: boolean;
}

export class BlurMaskFilterNode extends JsiDeclarationNode<
  BlurMaskFilterNodeProps,
  SkMaskFilter
> {
  constructor(Skia: Skia, props: BlurMaskFilterNodeProps) {
    super(Skia, DeclarationType.MaskFilter, NodeType.BlurMaskFilter, props);
  }

  get() {
    const { style, sigma, respectCTM } = this.props;
    return this.Skia.MaskFilter.MakeBlur(style, sigma, respectCTM);
  }
}
