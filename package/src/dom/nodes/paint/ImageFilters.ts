import type { DeclarationNode } from "../Node";
import { NestedDeclarationNode, NodeType } from "../Node";
import type { SkColorFilter } from "../../../skia/types/ColorFilter/ColorFilter";
import type {
  ColorChannel,
  Skia,
  SkImageFilter,
  SkShader,
} from "../../../skia/types";

abstract class ImageFilterDeclaration<
  P,
  Nullable extends null | never = never
> extends NestedDeclarationNode<P, SkImageFilter, Nullable> {
  constructor(type: NodeType, props: P) {
    super(type, props);
  }
  addChild(
    child:
      | DeclarationNode<unknown, SkImageFilter>
      | DeclarationNode<unknown, SkShader>
      | DeclarationNode<unknown, SkColorFilter>
  ) {
    this.children.push(child);
  }
}

export interface OffsetImageFilterNodeProps {
  dx: number;
  dy: number;
}

export class OffsetImageFilterNode extends ImageFilterDeclaration<OffsetImageFilterNodeProps> {
  constructor(props: OffsetImageFilterNodeProps) {
    super(NodeType.OffsetImageFilter, props);
  }

  get(Skia: Skia) {
    const { dx, dy } = this.props;
    const compose = Skia.ImageFilter.MakeOffset.bind(Skia.ImageFilter, dx, dy);
    return this.getRecursively(Skia, compose);
  }
}

export interface DisplacementMapImageFilterNodeProps {
  channelX: ColorChannel;
  channelY: ColorChannel;
  scale: number;
  in1: SkImageFilter;
}

export class DisplacementMapImageFilterNode extends ImageFilterDeclaration<DisplacementMapImageFilterNodeProps> {
  constructor(props: DisplacementMapImageFilterNodeProps) {
    super(NodeType.DisplacementMapImageFilter, props);
  }

  get(Skia: Skia) {
    const { channelX, channelY, scale } = this.props;
    const compose = Skia.ImageFilter.MakeDisplacementMap.bind(
      Skia.ImageFilter,
      channelX,
      channelY,
      scale
    );
    return this.getRecursively(Skia, compose);
  }
}
