import type {
  Skia,
  SkImage,
  SkShader,
  SkMatrix,
  FilterMode,
  MipmapMode,
  TileMode,
  SkRuntimeEffect,
} from "../../../skia/types";
import { JsiDeclarationNode, JsiNestedDeclarationNode } from "../Node";
import type { LinearGradientProps } from "../../types";
import { DeclarationType, NodeType } from "../../types";
import { processGradientProps } from "../datatypes";

export interface ShaderNodeProps {
  runtimeEffect: SkRuntimeEffect;
  uniforms: number[];
}

export class ShaderNode extends JsiNestedDeclarationNode<
  ShaderNodeProps,
  SkShader
> {
  constructor(Skia: Skia, props: ShaderNodeProps) {
    super(Skia, DeclarationType.Shader, NodeType.Shader, props);
  }

  get() {
    const { runtimeEffect, uniforms } = this.props;
    if (this.children.length === 0) {
      return runtimeEffect.makeShader(uniforms);
    }
    return runtimeEffect.makeShaderWithChildren(
      uniforms,
      this.children.map((child) => child.get())
    );
  }
}

export interface ImageShaderNodeProps {
  image: SkImage;
  tx: TileMode;
  ty: TileMode;
  fm: FilterMode;
  mm: MipmapMode;
  localMatrix?: SkMatrix;
}

export class ImageShaderNode extends JsiDeclarationNode<
  ImageShaderNodeProps,
  SkShader
> {
  constructor(Skia: Skia, props: ImageShaderNodeProps) {
    super(Skia, DeclarationType.Shader, NodeType.ImageShader, props);
  }

  get() {
    const { image, tx, ty, fm, mm, localMatrix } = this.props;
    return image.makeShaderOptions(tx, ty, fm, mm, localMatrix);
  }
}

export class LinearGradientNode extends JsiDeclarationNode<
  LinearGradientProps,
  SkShader
> {
  constructor(Skia: Skia, props: LinearGradientProps) {
    super(Skia, DeclarationType.Shader, NodeType.LinearGradient, props);
  }

  get() {
    const { start, end } = this.props;
    const { colors, positions, mode, localMatrix, flags } =
      processGradientProps(this.Skia, this.props);
    return this.Skia.Shader.MakeLinearGradient(
      start,
      end,
      colors,
      positions ?? null,
      mode,
      localMatrix,
      flags
    );
  }
}
