import { NestedDeclarationNode, NodeType } from "../Node";
import type { Skia, SkImageFilter } from "../../../skia/types";

export interface OffsetImageFilterNodeProps {
  dx: number;
  dy: number;
}

export class OffsetImageFilterFilterNode extends NestedDeclarationNode<
  OffsetImageFilterNodeProps,
  SkImageFilter
> {
  constructor(props: OffsetImageFilterNodeProps) {
    super(NodeType.BlurMaskFilter, props);
  }

  get(Skia: Skia) {
    const { dx, dy } = this.props;
    const compose = Skia.ImageFilter.MakeOffset.bind(Skia.PathEffect, dx, dy);
    return this.getRecursively(Skia, compose);
  }
}
