import type { SkColorFilter } from "../../../skia/types/ColorFilter/ColorFilter";
import { exhaustiveCheck } from "../../../renderer/typeddash";
import type {
  ColorChannel,
  SkColor,
  SkImageFilter,
  SkRect,
  SkShader,
  Skia,
} from "../../../skia/types";
import { processUniforms, TileMode } from "../../../skia/types";
import { JsiNestedDeclarationNode } from "../Node";
import type {
  BlendProps,
  BlurImageFilterProps,
  DeclarationNode,
  OffsetImageFilterProps,
  RuntimeShaderImageFilterProps,
} from "../../types";
import { DeclarationType, NodeType } from "../../types";
import { processRadius, enumKey } from "../datatypes";

abstract class ImageFilterDeclaration<
  P,
  Nullable extends null | never = never
> extends JsiNestedDeclarationNode<P, SkImageFilter, Nullable> {
  constructor(Skia: Skia, type: NodeType, props: P) {
    super(Skia, DeclarationType.ImageFilter, type, props);
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
        new ColorFilterImageFilterNode(this.Skia, { colorFilter: child })
      );
    } else if (child.isShader()) {
      this.children.push(
        new ShaderImageFilterNode(this.Skia, { shader: child })
      );
    } else {
      exhaustiveCheck(child);
    }
  }

  protected getMandatoryChild(index = 0, parent: string) {
    const child = this.children[index];
    if (!child) {
      throw new Error("Missing child in " + parent);
    }
    return child.get();
  }

  protected getChild(index = 0) {
    const child = this.children[index];
    if (!child) {
      return null;
    }
    return child.get();
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
    return this.Skia.ImageFilter.MakeOffset(x, y, this.getChild());
  }
}

export interface DisplacementMapImageFilterNodeProps {
  channelX: ColorChannel;
  channelY: ColorChannel;
  scale: number;
  in1: SkImageFilter;
}

export class DisplacementMapImageFilterNode extends ImageFilterDeclaration<DisplacementMapImageFilterNodeProps> {
  constructor(Skia: Skia, props: DisplacementMapImageFilterNodeProps) {
    super(Skia, NodeType.DisplacementMapImageFilter, props);
  }

  get() {
    const { channelX, channelY, scale } = this.props;
    return this.Skia.ImageFilter.MakeDisplacementMap(
      channelX,
      channelY,
      scale,
      this.getMandatoryChild(0, "DisplacementMap"),
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
      this.getChild()
    );
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
  constructor(Skia: Skia, props: DropShadowImageFilterNodeProps) {
    super(Skia, NodeType.BlurImageFilter, props);
  }

  get() {
    const { dx, dy, sigmaX, sigmaY, color, cropRect, only } = this.props;
    const input = this.getChild();
    if (only) {
      return this.Skia.ImageFilter.MakeDropShadowOnly(
        dx,
        dy,
        sigmaX,
        sigmaY,
        color,
        input,
        cropRect
      );
    }
    return this.Skia.ImageFilter.MakeDropShadow(
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
  constructor(Skia: Skia, props: MorphologyImageFilterNodeProps) {
    super(Skia, NodeType.MorphologyImageFilter, props);
  }

  get() {
    const { rx, ry, cropRect, op } = this.props;
    const input = this.getChild();
    if (op === MorphologyOperator.Erode) {
      return this.Skia.ImageFilter.MakeErode(rx, ry, input, cropRect);
    }
    return this.Skia.ImageFilter.MakeDilate(rx, ry, input, cropRect);
  }
}

export class BlendImageFilterNode extends ImageFilterDeclaration<BlendProps> {
  constructor(Skia: Skia, props: BlendProps) {
    super(Skia, NodeType.BlendImageFilter, props);
  }

  get() {
    const { mode } = this.props;
    const a = this.getMandatoryChild(0, "BlendMode");
    const b = this.getChild(1);
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
    const input = this.getChild();
    return this.Skia.ImageFilter.MakeRuntimeShader(rtb, null, input);
  }
}
