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
import { DeclarationNode, NestedDeclarationNode, NodeType } from "../Node";

export interface ShaderNodeProps {
  runtimeEffect: SkRuntimeEffect;
  uniforms: number[];
}

export class ShaderNode extends NestedDeclarationNode<
  ShaderNodeProps,
  SkShader
> {
  constructor(props: ShaderNodeProps) {
    super(NodeType.Shader, props);
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
    super(NodeType.ImageShader, props);
  }

  get() {
    const { image, tx, ty, fm, mm, localMatrix } = this.props;
    return image.makeShaderOptions(tx, ty, fm, mm, localMatrix);
  }
}
