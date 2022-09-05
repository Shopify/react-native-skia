import type {
  SkImageFilter,
  SkShader,
  Skia,
  SkColorFilter,
} from "../../../skia/types";
import { ColorChannel, processUniforms, TileMode } from "../../../skia/types";
import type {
  BlendImageFilterProps,
  BlurImageFilterProps,
  DeclarationNode,
  DisplacementMapImageFilterProps,
  DropShadowImageFilterProps,
  MorphologyImageFilterProps,
  OffsetImageFilterProps,
  RuntimeShaderImageFilterProps,
} from "../../types";
import { DeclarationType, NodeType } from "../../types";
import { processRadius, enumKey, processColor } from "../datatypes";
import { JsiDeclarationNode } from "../Node";

abstract class ImageFilterDeclaration<
  P,
  Nullable extends null | never = never
> extends JsiDeclarationNode<P, SkImageFilter, Nullable> {
  constructor(Skia: Skia, type: NodeType, props: P) {
    super(Skia, DeclarationType.ImageFilter, type, props);
  }
}

export interface ShaderImageFilterNodeProps {
  shader: DeclarationNode<unknown, SkShader>;
}

export class ShaderImageFilterNode extends ImageFilterDeclaration<ShaderImageFilterNodeProps> {
  constructor(Skia: Skia, props: ShaderImageFilterNodeProps) {
    super(Skia, NodeType.OffsetImageFilter, props);
  }

  get() {
    const { shader } = this.props;
    return this.Skia.ImageFilter.MakeShader(shader.get(), null);
  }
}

export interface ColorFilterImageFilterNodeProps {
  colorFilter: DeclarationNode<unknown, SkColorFilter>;
}

export class ColorFilterImageFilterNode extends ImageFilterDeclaration<ColorFilterImageFilterNodeProps> {
  constructor(Skia: Skia, props: ColorFilterImageFilterNodeProps) {
    super(Skia, NodeType.OffsetImageFilter, props);
  }

  get() {
    const { colorFilter } = this.props;
    return this.Skia.ImageFilter.MakeColorFilter(colorFilter.get(), null);
  }
}

export class OffsetImageFilterNode extends ImageFilterDeclaration<OffsetImageFilterProps> {
  constructor(Skia: Skia, props: OffsetImageFilterProps) {
    super(Skia, NodeType.OffsetImageFilter, props);
  }

  get() {
    const { x, y } = this.props;
    return this.Skia.ImageFilter.MakeOffset(x, y, this.getChild(0));
  }
}

export class DisplacementMapImageFilterNode extends ImageFilterDeclaration<DisplacementMapImageFilterProps> {
  constructor(Skia: Skia, props: DisplacementMapImageFilterProps) {
    super(Skia, NodeType.DisplacementMapImageFilter, props);
  }

  get() {
    const { channelX, channelY, scale } = this.props;
    return this.Skia.ImageFilter.MakeDisplacementMap(
      ColorChannel[enumKey(channelX)],
      ColorChannel[enumKey(channelY)],
      scale,
      this.getChild(0),
      this.getChild(1)
    );
  }
}

export class BlurImageFilterNode extends ImageFilterDeclaration<BlurImageFilterProps> {
  constructor(Skia: Skia, props: BlurImageFilterProps) {
    super(Skia, NodeType.BlurImageFilter, props);
  }

  get() {
    const { mode, blur } = this.props;
    const sigma = processRadius(this.Skia, blur);
    return this.Skia.ImageFilter.MakeBlur(
      sigma.x,
      sigma.y,
      TileMode[enumKey(mode)],
      this.getChild(0)
    );
  }
}

export class DropShadowImageFilterNode extends ImageFilterDeclaration<DropShadowImageFilterProps> {
  constructor(Skia: Skia, props: DropShadowImageFilterProps) {
    super(Skia, NodeType.BlurImageFilter, props);
  }

  get() {
    const { dx, dy, blur, shadowOnly, color: cl } = this.props;
    const color = processColor(this.Skia, cl, 1);
    const input = this.getChild<SkImageFilter>(0);
    if (shadowOnly) {
      return this.Skia.ImageFilter.MakeDropShadowOnly(
        dx,
        dy,
        blur,
        blur,
        color,
        input
      );
    }
    return this.Skia.ImageFilter.MakeDropShadow(
      dx,
      dy,
      blur,
      blur,
      color,
      input
    );
  }
}

export enum MorphologyOperator {
  Erode,
  Dilate,
}

export class MorphologyImageFilterNode extends ImageFilterDeclaration<MorphologyImageFilterProps> {
  constructor(Skia: Skia, props: MorphologyImageFilterProps) {
    super(Skia, NodeType.MorphologyImageFilter, props);
  }

  get() {
    const { operator } = this.props;
    const r = processRadius(this.Skia, this.props.radius);
    const input = this.getChild<SkImageFilter>(0);
    if (MorphologyOperator[enumKey(operator)] === MorphologyOperator.Erode) {
      return this.Skia.ImageFilter.MakeErode(r.x, r.y, input);
    }
    return this.Skia.ImageFilter.MakeDilate(r.x, r.y, input);
  }
}

export class BlendImageFilterNode extends ImageFilterDeclaration<BlendImageFilterProps> {
  constructor(Skia: Skia, props: BlendImageFilterProps) {
    super(Skia, NodeType.BlendImageFilter, props);
  }

  get() {
    const { mode } = this.props;
    const a = this.getChild<SkImageFilter>(0);
    const b = this.getChild<SkImageFilter>(1);
    return this.Skia.ImageFilter.MakeBlend(mode, a, b);
  }
}

export class RuntimeShaderImageFilterNode extends ImageFilterDeclaration<RuntimeShaderImageFilterProps> {
  constructor(Skia: Skia, props: RuntimeShaderImageFilterProps) {
    super(Skia, NodeType.RuntimeShaderImageFilter, props);
  }

  get() {
    const { source, uniforms } = this.props;
    const rtb = this.Skia.RuntimeShaderBuilder(source);
    if (uniforms) {
      processUniforms(source, uniforms, rtb);
    }
    const input = this.getChild<SkImageFilter>(0);
    return this.Skia.ImageFilter.MakeRuntimeShader(rtb, null, input);
  }
}
