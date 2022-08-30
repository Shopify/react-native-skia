import type { DeclarationNode } from "../Node";
import { DeclarationType, NestedDeclarationNode, NodeType } from "../Node";
import type { SkColorFilter } from "../../../skia/types/ColorFilter/ColorFilter";
import { exhaustiveCheck } from "../../../renderer/typeddash";
import type {
  BlendMode,
  ColorChannel,
  SkColor,
  Skia,
  SkImageFilter,
  SkRect,
  SkRuntimeShaderBuilder,
  SkShader,
  TileMode,
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
      this.children.push(
        new ColorFilterImageFilterNode({ colorFilter: child })
      );
    } else if (child.isShader()) {
      this.children.push(new ShaderImageFilterNode({ shader: child }));
    } else {
      exhaustiveCheck(child);
    }
  }

  protected getMandatoryChild(Skia: Skia, index = 0, parent: string) {
    const child = this.children[index];
    if (!child) {
      throw new Error("Missing child in " + parent);
    }
    return child.get(Skia);
  }

  protected getChild(Skia: Skia, index = 0) {
    const child = this.children[index];
    if (!child) {
      return null;
    }
    return child.get(Skia);
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
    return Skia.ImageFilter.MakeOffset(dx, dy, this.getChild(Skia));
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
    return Skia.ImageFilter.MakeDisplacementMap(
      channelX,
      channelY,
      scale,
      this.getMandatoryChild(Skia, 0, "DisplacementMap"),
      this.getChild(Skia, 1)
    );
  }
}

export interface BlurImageFilterNodeProps {
  sigmaX: number;
  sigmaY: number;
  mode: TileMode;
}

export class BlurImageFilterNode extends ImageFilterDeclaration<BlurImageFilterNodeProps> {
  constructor(props: BlurImageFilterNodeProps) {
    super(NodeType.BlurImageFilter, props);
  }

  get(Skia: Skia) {
    const { sigmaX, sigmaY, mode } = this.props;
    return Skia.ImageFilter.MakeBlur(sigmaX, sigmaY, mode, this.getChild(Skia));
  }
}

export interface DropShadowImageFilterNodeProps {
  dx: number;
  dy: number;
  sigmaX: number;
  sigmaY: number;
  color: SkColor;
  input: SkImageFilter | null;
  cropRect?: SkRect;
  only?: boolean;
}

export class DropShadowImageFilterNode extends ImageFilterDeclaration<DropShadowImageFilterNodeProps> {
  constructor(props: DropShadowImageFilterNodeProps) {
    super(NodeType.BlurImageFilter, props);
  }

  get(Skia: Skia) {
    const { dx, dy, sigmaX, sigmaY, color, cropRect, only } = this.props;
    const input = this.getChild(Skia);
    if (only) {
      return Skia.ImageFilter.MakeDropShadowOnly(
        dx,
        dy,
        sigmaX,
        sigmaY,
        color,
        input,
        cropRect
      );
    }
    return Skia.ImageFilter.MakeDropShadow(
      dx,
      dy,
      sigmaX,
      sigmaY,
      color,
      input,
      cropRect
    );
  }
}

export enum MorphologyOperator {
  Erode,
  Dilate,
}

export interface MorphologyImageFilterNodeProps {
  rx: number;
  ry: number;
  cropRect?: SkRect;
  op: MorphologyOperator;
}

export class MorphologyImageFilterNode extends ImageFilterDeclaration<MorphologyImageFilterNodeProps> {
  constructor(props: MorphologyImageFilterNodeProps) {
    super(NodeType.MorphologyImageFilter, props);
  }

  get(Skia: Skia) {
    const { rx, ry, cropRect, op } = this.props;
    const input = this.getChild(Skia);
    if (op === MorphologyOperator.Erode) {
      return Skia.ImageFilter.MakeErode(rx, ry, input, cropRect);
    }
    return Skia.ImageFilter.MakeDilate(rx, ry, input, cropRect);
  }
}

export interface BlendImageFilterNodeProps {
  mode: BlendMode;
  cropRect?: SkRect;
}

export class BlendImageFilterNode extends ImageFilterDeclaration<BlendImageFilterNodeProps> {
  constructor(props: BlendImageFilterNodeProps) {
    super(NodeType.BlendImageFilter, props);
  }

  get(Skia: Skia) {
    const { mode, cropRect } = this.props;
    const a = this.getMandatoryChild(Skia, 0, "BlendMode");
    const b = this.getChild(Skia, 1);
    return Skia.ImageFilter.MakeBlend(mode, a, b, cropRect);
  }
}

export interface RuntimeShaderImageFilterNodeProps {
  builder: SkRuntimeShaderBuilder;
  childShaderName: string | null;
}

export class RuntimeShaderImageFilterNode extends ImageFilterDeclaration<RuntimeShaderImageFilterNodeProps> {
  constructor(props: RuntimeShaderImageFilterNodeProps) {
    super(NodeType.RuntimeShaderImageFilter, props);
  }

  get(Skia: Skia) {
    const { builder, childShaderName } = this.props;
    const input = this.getChild(Skia);
    return Skia.ImageFilter.MakeRuntimeShader(builder, childShaderName, input);
  }
}
