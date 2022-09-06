import {
  processUniforms,
  FilterMode,
  MipmapMode,
  TileMode,
} from "../../../skia/types";
import type { SkShader, Skia } from "../../../skia/types";
import { JsiDeclarationNode } from "../Node";
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

export abstract class ShaderDeclaration<P> extends JsiDeclarationNode<
  P,
  SkShader
> {
  constructor(Skia: Skia, type: NodeType, props: P) {
    super(Skia, DeclarationType.Shader, type, props);
  }
}

export class ShaderNode extends ShaderDeclaration<ShaderProps> {
  constructor(Skia: Skia, props: ShaderProps) {
    super(Skia, NodeType.Shader, props);
  }

  get() {
    const { source, uniforms, ...transform } = this.props;
    return source.makeShaderWithChildren(
      processUniforms(source, uniforms),
      // TODO: fix it by creating the ShaderDeclaration subclass (e.g ImageFilterDeclaration)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.children().map((child) => (child as any).get()),
      lm(this.Skia.Matrix(), transform)
    );
  }
}

export class ImageShaderNode extends ShaderDeclaration<ImageShaderProps> {
  constructor(Skia: Skia, props: ImageShaderProps) {
    super(Skia, NodeType.ImageShader, props);
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

export class ColorNode extends ShaderDeclaration<ColorProps> {
  constructor(Skia: Skia, props: ColorProps) {
    super(Skia, NodeType.ColorShader, props);
  }

  get() {
    const { color } = this.props;
    return this.Skia.Shader.MakeColor(processColor(this.Skia, color, 1));
  }
}

export class TurbulenceNode extends ShaderDeclaration<TurbulenceProps> {
  constructor(Skia: Skia, props: TurbulenceProps) {
    super(Skia, NodeType.Turbulence, props);
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

export class FractalNoiseNode extends ShaderDeclaration<FractalNoiseProps> {
  constructor(Skia: Skia, props: FractalNoiseProps) {
    super(Skia, NodeType.FractalNoise, props);
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

export class LinearGradientNode extends ShaderDeclaration<LinearGradientProps> {
  constructor(Skia: Skia, props: LinearGradientProps) {
    super(Skia, NodeType.LinearGradient, props);
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

export class RadialGradientNode extends ShaderDeclaration<RadialGradientProps> {
  constructor(Skia: Skia, props: RadialGradientProps) {
    super(Skia, NodeType.RadialGradient, props);
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

export class SweepGradientNode extends ShaderDeclaration<SweepGradientProps> {
  constructor(Skia: Skia, props: SweepGradientProps) {
    super(Skia, NodeType.SweepGradient, props);
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

export class TwoPointConicalGradientNode extends ShaderDeclaration<TwoPointConicalGradientProps> {
  constructor(Skia: Skia, props: TwoPointConicalGradientProps) {
    super(Skia, NodeType.TwoPointConicalGradient, props);
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
