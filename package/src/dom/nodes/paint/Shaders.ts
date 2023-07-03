import {
  processUniforms,
  FilterMode,
  MipmapMode,
  TileMode,
} from "../../../skia/types";
import type { NodeContext } from "../Node";
import { JsiDeclarationNode } from "../Node";
import type {
  ColorProps,
  DeclarationContext,
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
import {
  enumKey,
  fitRects,
  getRect,
  processGradientProps,
  processTransformProps,
  rect2rect,
} from "../datatypes";

export abstract class ShaderDeclaration<P> extends JsiDeclarationNode<P> {
  constructor(ctx: NodeContext, type: NodeType, props: P) {
    super(ctx, DeclarationType.Shader, type, props);
  }
}

export class ShaderNode extends ShaderDeclaration<ShaderProps> {
  constructor(ctx: NodeContext, props: ShaderProps) {
    super(ctx, NodeType.Shader, props);
  }

  decorate(ctx: DeclarationContext) {
    this.decorateChildren(ctx);
    const { source, uniforms, ...transform } = this.props;
    const m3 = this.Skia.Matrix();
    processTransformProps(m3, transform);
    const shader = source.makeShaderWithChildren(
      processUniforms(source, uniforms),
      ctx.shaders.popAll(),
      m3
    );
    ctx.shaders.push(shader);
  }
}

export class ImageShaderNode extends ShaderDeclaration<ImageShaderProps> {
  constructor(ctx: NodeContext, props: ImageShaderProps) {
    super(ctx, NodeType.ImageShader, props);
  }

  decorate(ctx: DeclarationContext) {
    const { fit, image, tx, ty, fm, mm, ...imageShaderProps } = this.props;
    if (!image) {
      return;
    }

    const rct = getRect(this.Skia, imageShaderProps);
    const m3 = this.Skia.Matrix();
    if (rct) {
      const rects = fitRects(
        fit,
        { x: 0, y: 0, width: image.width(), height: image.height() },
        rct
      );
      const [x, y, sx, sy] = rect2rect(rects.src, rects.dst);
      m3.translate(x.translateX, y.translateY);
      m3.scale(sx.scaleX, sy.scaleY);
    }
    const lm = this.Skia.Matrix();
    lm.concat(m3);
    processTransformProps(lm, imageShaderProps);
    const shader = image.makeShaderOptions(
      TileMode[enumKey(tx)],
      TileMode[enumKey(ty)],
      FilterMode[enumKey(fm)],
      MipmapMode[enumKey(mm)],
      lm
    );
    ctx.shaders.push(shader);
  }
}

export class ColorNode extends ShaderDeclaration<ColorProps> {
  constructor(ctx: NodeContext, props: ColorProps) {
    super(ctx, NodeType.ColorShader, props);
  }

  decorate(ctx: DeclarationContext) {
    const { color } = this.props;
    const shader = this.Skia.Shader.MakeColor(this.Skia.Color(color));
    ctx.shaders.push(shader);
  }
}

export class TurbulenceNode extends ShaderDeclaration<TurbulenceProps> {
  constructor(ctx: NodeContext, props: TurbulenceProps) {
    super(ctx, NodeType.Turbulence, props);
  }

  decorate(ctx: DeclarationContext) {
    const { freqX, freqY, octaves, seed, tileWidth, tileHeight } = this.props;
    const shader = this.Skia.Shader.MakeTurbulence(
      freqX,
      freqY,
      octaves,
      seed,
      tileWidth,
      tileHeight
    );
    ctx.shaders.push(shader);
  }
}

export class FractalNoiseNode extends ShaderDeclaration<FractalNoiseProps> {
  constructor(ctx: NodeContext, props: FractalNoiseProps) {
    super(ctx, NodeType.FractalNoise, props);
  }

  decorate(ctx: DeclarationContext) {
    const { freqX, freqY, octaves, seed, tileWidth, tileHeight } = this.props;
    const shader = this.Skia.Shader.MakeFractalNoise(
      freqX,
      freqY,
      octaves,
      seed,
      tileWidth,
      tileHeight
    );
    ctx.shaders.push(shader);
  }
}

export class LinearGradientNode extends ShaderDeclaration<LinearGradientProps> {
  constructor(ctx: NodeContext, props: LinearGradientProps) {
    super(ctx, NodeType.LinearGradient, props);
  }

  decorate(ctx: DeclarationContext) {
    const { start, end } = this.props;
    const { colors, positions, mode, localMatrix, flags } =
      processGradientProps(this.Skia, this.props);
    const shader = this.Skia.Shader.MakeLinearGradient(
      start,
      end,
      colors,
      positions ?? null,
      mode,
      localMatrix,
      flags
    );
    ctx.shaders.push(shader);
  }
}

export class RadialGradientNode extends ShaderDeclaration<RadialGradientProps> {
  constructor(ctx: NodeContext, props: RadialGradientProps) {
    super(ctx, NodeType.RadialGradient, props);
  }

  decorate(ctx: DeclarationContext) {
    const { c, r } = this.props;
    const { colors, positions, mode, localMatrix, flags } =
      processGradientProps(this.Skia, this.props);
    const shader = this.Skia.Shader.MakeRadialGradient(
      c,
      r,
      colors,
      positions,
      mode,
      localMatrix,
      flags
    );
    ctx.shaders.push(shader);
  }
}

export class SweepGradientNode extends ShaderDeclaration<SweepGradientProps> {
  constructor(ctx: NodeContext, props: SweepGradientProps) {
    super(ctx, NodeType.SweepGradient, props);
  }

  decorate(ctx: DeclarationContext) {
    const { c, start, end } = this.props;
    const { colors, positions, mode, localMatrix, flags } =
      processGradientProps(this.Skia, this.props);
    const shader = this.Skia.Shader.MakeSweepGradient(
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
    ctx.shaders.push(shader);
  }
}

export class TwoPointConicalGradientNode extends ShaderDeclaration<TwoPointConicalGradientProps> {
  constructor(ctx: NodeContext, props: TwoPointConicalGradientProps) {
    super(ctx, NodeType.TwoPointConicalGradient, props);
  }

  decorate(ctx: DeclarationContext) {
    const { startR, endR, start, end } = this.props;
    const { colors, positions, mode, localMatrix, flags } =
      processGradientProps(this.Skia, this.props);
    const shader = this.Skia.Shader.MakeTwoPointConicalGradient(
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
    ctx.shaders.push(shader);
  }
}
