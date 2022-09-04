import {
  processUniforms,
  FilterMode,
  MipmapMode,
  TileMode,
} from "../../../skia/types";
import type { SkShader, Skia } from "../../../skia/types";
import { JsiDeclarationNode, JsiNestedDeclarationNode } from "../Node";
import type {
  ColorProps,
  FractalNoiseProps,
  ImageShaderProps,
  LinearGradientProps,
  RadialGradientProps,
  ShaderProps,
  SweepGradientProps,
  TurbulenceProps,
  TwoPointConicalGradientProps,
} from "../../types";
import { DeclarationType, NodeType } from "../../types";
import { processColor } from "../datatypes/Color";
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

export class ColorNode extends JsiDeclarationNode<ColorProps, SkShader> {
  constructor(Skia: Skia, props: ColorProps) {
    super(Skia, DeclarationType.Shader, NodeType.Color, props);
  }

  get() {
    const { color } = this.props;
    return this.Skia.Shader.MakeColor(processColor(this.Skia, color, 1));
  }
}
export class TurbulenceNode extends JsiDeclarationNode<
  TurbulenceProps,
  SkShader
> {
  constructor(Skia: Skia, props: TurbulenceProps) {
    super(Skia, DeclarationType.Shader, NodeType.Turbulence, props);
  }

  get() {
    const { freqX, freqY, octaves, seed, tileWidth, tileHeight } = this.props;
    return this.Skia.Shader.MakeTurbulence(
      freqX,
      freqY,
      octaves,
      seed,
      tileWidth,
      tileHeight
    );
  }
}

export class FractalNoiseNode extends JsiDeclarationNode<
  FractalNoiseProps,
  SkShader
> {
  constructor(Skia: Skia, props: FractalNoiseProps) {
    super(Skia, DeclarationType.Shader, NodeType.FractalNoise, props);
  }

  get() {
    const { freqX, freqY, octaves, seed, tileWidth, tileHeight } = this.props;
    return this.Skia.Shader.MakeFractalNoise(
      freqX,
      freqY,
      octaves,
      seed,
      tileWidth,
      tileHeight
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

export class RadialGradientNode extends JsiDeclarationNode<
  RadialGradientProps,
  SkShader
> {
  constructor(Skia: Skia, props: RadialGradientProps) {
    super(Skia, DeclarationType.Shader, NodeType.RadialGradient, props);
  }

  get() {
    const { c, r } = this.props;
    const { colors, positions, mode, localMatrix, flags } =
      processGradientProps(this.Skia, this.props);
    return this.Skia.Shader.MakeRadialGradient(
      c,
      r,
      colors,
      positions,
      mode,
      localMatrix,
      flags
    );
  }
}

export class SweepGradientNode extends JsiDeclarationNode<
  SweepGradientProps,
  SkShader
> {
  constructor(Skia: Skia, props: SweepGradientProps) {
    super(Skia, DeclarationType.Shader, NodeType.SweepGradient, props);
  }

  get() {
    const { c, start, end } = this.props;
    const { colors, positions, mode, localMatrix, flags } =
      processGradientProps(this.Skia, this.props);
    return this.Skia.Shader.MakeSweepGradient(
      c.x,
      c.y,
      colors,
      positions,
      mode,
      localMatrix,
      flags,
      start,
      end
    );
  }
}

export class TwoPointConicalGradientNode extends JsiDeclarationNode<
  TwoPointConicalGradientProps,
  SkShader
> {
  constructor(Skia: Skia, props: TwoPointConicalGradientProps) {
    super(
      Skia,
      DeclarationType.Shader,
      NodeType.TwoPointConicalGradient,
      props
    );
  }

  get() {
    const { startR, endR, start, end } = this.props;
    const { colors, positions, mode, localMatrix, flags } =
      processGradientProps(this.Skia, this.props);
    return this.Skia.Shader.MakeTwoPointConicalGradient(
      start,
      startR,
      end,
      endR,
      colors,
      positions,
      mode,
      localMatrix,
      flags
    );
  }
}
