import { NestedDeclarationNode, NodeType } from "../Node";
import type { ColorChannel, Skia, SkImageFilter } from "../../../skia/types";

export interface OffsetImageFilterNodeProps {
  dx: number;
  dy: number;
}

export class OffsetImageFilterNode extends NestedDeclarationNode<
  OffsetImageFilterNodeProps,
  SkImageFilter
> {
  constructor(props: OffsetImageFilterNodeProps) {
    super(NodeType.OffsetImageFilter, props);
  }

  get(Skia: Skia) {
    const { dx, dy } = this.props;
    const compose = Skia.ImageFilter.MakeOffset.bind(Skia.PathEffect, dx, dy);
    return this.getRecursively(Skia, compose);
  }
}

export interface DisplacementMapImageFilterNodeProps {
  channelX: ColorChannel;
  channelY: ColorChannel;
  scale: number;
  in1: SkImageFilter;
}

export class DisplacementMapImageFilterNode extends NestedDeclarationNode<
  DisplacementMapImageFilterNodeProps,
  SkImageFilter
> {
  constructor(props: DisplacementMapImageFilterNodeProps) {
    super(NodeType.DisplacementMapImageFilter, props);
  }

  get(Skia: Skia) {
    const { channelX, channelY, scale } = this.props;
    const compose = Skia.ImageFilter.MakeDisplacementMap.bind(
      Skia.PathEffect,
      channelX,
      channelY,
      scale
    );
    return this.getRecursively(Skia, compose);
  }
}
