import { DeclarationNode, DeclarationType, NodeType } from "../Node";
import type { BlurStyle, Skia, SkMaskFilter } from "../../../skia/types";

export interface BlurMaskFilterNodeProps {
  style: BlurStyle;
  sigma: number;
  respectCTM: boolean;
}

export class BlurMaskFilterNode extends DeclarationNode<
  BlurMaskFilterNodeProps,
  SkMaskFilter
> {
  constructor(props: BlurMaskFilterNodeProps) {
    super(DeclarationType.MaskFilter, NodeType.BlurMaskFilter, props);
  }

  get(Skia: Skia) {
    const { style, sigma, respectCTM } = this.props;
    return Skia.MaskFilter.MakeBlur(style, sigma, respectCTM);
  }
}
