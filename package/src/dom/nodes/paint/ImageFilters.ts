import { DeclarationNode, DeclarationType } from "../Node";
import { NestedDeclarationNode, NodeType } from "../Node";
import type { SkColorFilter } from "../../../skia/types/ColorFilter/ColorFilter";
import { exhaustiveCheck } from '../../../renderer/typeddash';
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
    super(DeclarationType.ImageFilter, type, props);
  }
  addChild(
    child:
      | DeclarationNode<unknown, SkImageFilter>
      | DeclarationNode<unknown, SkShader>
      | DeclarationNode<unknown, SkColorFilter>
  ) {
    if (child.isImageFilter()) {
      this.children.push(child);
    } else if (child.isColorFilter()) {
      this.children.push(new ColorFilterImageFilterNode({ colorFilter: child}));
    } else if (child.isShader()) {
      this.children.push(new ShaderImageFilterNode({ shader: child }));
    } else {
      exhaustiveCheck(child);
    }
  }
}

export interface ShaderImageFilterNodeProps {
  shader: DeclarationNode<unknown, SkShader>;
}

export class ShaderImageFilterNode extends ImageFilterDeclaration<ShaderImageFilterNodeProps> {
  constructor(props: ShaderImageFilterNodeProps) {
    super(NodeType.OffsetImageFilter, props);
  }

  get(Skia: Skia) {
    const { shader } = this.props;
    return Skia.ImageFilter.MakeShader(shader.get(Skia), null);
  }
}

export interface ColorFilterImageFilterNodeProps {
  colorFilter: DeclarationNode<unknown, SkColorFilter>;
}

export class ColorFilterImageFilterNode extends ImageFilterDeclaration<ColorFilterImageFilterNodeProps> {
  constructor(props: ColorFilterImageFilterNodeProps) {
    super(NodeType.OffsetImageFilter, props);
  }

  get(Skia: Skia) {
    const { colorFilter } = this.props;
    return Skia.ImageFilter.MakeColorFilter(colorFilter.get(Skia), null);
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
