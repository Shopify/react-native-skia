import {
  processUniforms,
  FilterMode,
  MipmapMode,
  TileMode,
} from "../../../skia/types";
import type { SkShader, Skia } from "../../../skia/types";
import { JsiDeclarationNode, JsiNestedDeclarationNode } from "../Node";
import type {
  ImageShaderProps,
  LinearGradientProps,
  ShaderProps,
} from "../../types";
import { DeclarationType, NodeType } from "../../types";
import {
  enumKey,
  fitRects,
  getRect,
  localMatrix as lm,
  processGradientProps,
  rect2rect,
} from "../datatypes";

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

export class ImageShaderNode extends JsiDeclarationNode<
  ImageShaderProps,
  SkShader
> {
  constructor(Skia: Skia, props: ImageShaderProps) {
    super(Skia, DeclarationType.Shader, NodeType.ImageShader, props);
  }

  get() {
    const { fit, image, tx, ty, fm, mm, ...imageShaderProps } = this.props;
    const rct = getRect(this.Skia, imageShaderProps);
    if (rct) {
      const rects = fitRects(
        fit,
        { x: 0, y: 0, width: image.width(), height: image.height() },
        rct
      );
      const m3 = rect2rect(rects.src, rects.dst);
      imageShaderProps.transform = [
        ...(imageShaderProps.transform ?? []),
        ...m3,
      ];
    }
    return image.makeShaderOptions(
      TileMode[enumKey(tx)],
      TileMode[enumKey(ty)],
      FilterMode[enumKey(fm)],
      MipmapMode[enumKey(mm)],
      lm(this.props.matrix ?? this.Skia.Matrix(), imageShaderProps)
    );
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
