import { processUniforms } from "../../../skia/types";
import type {
  SkImage,
  SkShader,
  SkMatrix,
  FilterMode,
  MipmapMode,
  TileMode,
  Skia,
} from "../../../skia/types";
import { JsiDeclarationNode, JsiNestedDeclarationNode } from "../Node";
import type { LinearGradientProps, ShaderProps } from "../../types";
import { DeclarationType, NodeType } from "../../types";
import { localMatrix as lm, processGradientProps } from "../datatypes";

export class ShaderNode extends JsiNestedDeclarationNode<
  ShaderProps,
  SkShader
> {
  constructor(Skia: Skia, props: ShaderProps) {
    super(Skia, DeclarationType.Shader, NodeType.Shader, props);
  }

  get() {
    const { source, uniforms, ...transform } = this.props;
    return source.makeShaderWithChildren(
      processUniforms(source, uniforms),
      this.children.map((child) => child.get()),
      lm(this.Skia.Matrix(), transform)
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
