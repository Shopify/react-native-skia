import type { SkColor } from "../../../skia/types/Color";
import type { SkPoint } from "../../../../lib/typescript/src/skia/types/Point";
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
import { DeclarationType, NodeType } from "../../types";

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

export class LinearGradientNode extends JsiDeclarationNode<
  LinearGradientNodeProps,
  SkShader
> {
  constructor(Skia: Skia, props: LinearGradientNodeProps) {
    super(Skia, DeclarationType.Shader, NodeType.LinearGradient, props);
  }

  get() {
    const { start, end, colors, positions, mode, flags, localMatrix } =
      this.props;
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
