import type { SkColor } from "../../../skia/types/Color";
import type { SkPoint } from "../../../../lib/typescript/src/skia/types/Point";
import type {
  SkImage,
  SkShader,
  SkMatrix,
  FilterMode,
  MipmapMode,
  TileMode,
  SkRuntimeEffect,
  Skia,
} from "../../../skia/types";
import {
  DeclarationNode,
  DeclarationType,
  NestedDeclarationNode,
  NodeType,
} from "../Node";

export interface ShaderNodeProps {
  runtimeEffect: SkRuntimeEffect;
  uniforms: number[];
}

export class ShaderNode extends NestedDeclarationNode<
  ShaderNodeProps,
  SkShader
> {
  constructor(props: ShaderNodeProps) {
    super(DeclarationType.Shader, NodeType.Shader, props);
  }

  get(Skia: Skia) {
    const { runtimeEffect, uniforms } = this.props;
    if (this.children.length === 0) {
      return runtimeEffect.makeShader(uniforms);
    }
    return runtimeEffect.makeShaderWithChildren(
      uniforms,
      this.children.map((child) => child.get(Skia))
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

export class ImageShaderNode extends DeclarationNode<
  ImageShaderNodeProps,
  SkShader
> {
  constructor(props: ImageShaderNodeProps) {
    super(DeclarationType.Shader, NodeType.ImageShader, props);
  }

  get() {
    const { image, tx, ty, fm, mm, localMatrix } = this.props;
    return image.makeShaderOptions(tx, ty, fm, mm, localMatrix);
  }
}

export interface GradientNodeProps {
  colors: SkColor[];
  positions?: number[];
  mode: TileMode;
  flags?: number;
  localMatrix?: SkMatrix;
}

export interface LinearGradientNodeProps extends GradientNodeProps {
  start: SkPoint;
  end: SkPoint;
}

export class LinearGradientNode extends DeclarationNode<
  LinearGradientNodeProps,
  SkShader
> {
  constructor(props: LinearGradientNodeProps) {
    super(DeclarationType.Shader, NodeType.LinearGradient, props);
  }

  get(Skia: Skia) {
    const { start, end, colors, positions, mode, flags, localMatrix } =
      this.props;
    return Skia.Shader.MakeLinearGradient(
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
