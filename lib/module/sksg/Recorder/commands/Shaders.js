import { enumKey, fitRects, getRect, processColor, processGradientProps, processTransformProps, rect2rect } from "../../../dom/nodes";
import { NodeType } from "../../../dom/types";
import { BlendMode, FilterMode, isCubicSampling, MipmapMode, processUniforms, TileMode } from "../../../skia/types";
import { composeDeclarations } from "../../utils";
import { CommandType } from "../Core";
const declareShader = (ctx, props) => {
  "worklet";

  const {
    source,
    uniforms,
    ...transform
  } = props;
  const m3 = ctx.Skia.Matrix();
  processTransformProps(m3, transform);
  const shader = source.makeShaderWithChildren(processUniforms(source, uniforms), ctx.shaders.splice(0, ctx.shaders.length), m3);
  ctx.shaders.push(shader);
};
const declareColorShader = (ctx, props) => {
  "worklet";

  const {
    color
  } = props;
  const shader = ctx.Skia.Shader.MakeColor(processColor(ctx.Skia, color));
  ctx.shaders.push(shader);
};
const declareFractalNoiseShader = (ctx, props) => {
  "worklet";

  const {
    freqX,
    freqY,
    octaves,
    seed,
    tileWidth,
    tileHeight
  } = props;
  const shader = ctx.Skia.Shader.MakeFractalNoise(freqX, freqY, octaves, seed, tileWidth, tileHeight);
  ctx.shaders.push(shader);
};
const declareTwoPointConicalGradientShader = (ctx, props) => {
  "worklet";

  const {
    startR,
    endR,
    start,
    end
  } = props;
  const {
    colors,
    positions,
    mode,
    localMatrix,
    flags
  } = processGradientProps(ctx.Skia, props);
  const shader = ctx.Skia.Shader.MakeTwoPointConicalGradient(start, startR, end, endR, colors, positions, mode, localMatrix, flags);
  ctx.shaders.push(shader);
};
const declareRadialGradientShader = (ctx, props) => {
  "worklet";

  const {
    c,
    r
  } = props;
  const {
    colors,
    positions,
    mode,
    localMatrix,
    flags
  } = processGradientProps(ctx.Skia, props);
  const shader = ctx.Skia.Shader.MakeRadialGradient(c, r, colors, positions, mode, localMatrix, flags);
  ctx.shaders.push(shader);
};
const declareSweepGradientShader = (ctx, props) => {
  "worklet";

  const {
    c,
    start,
    end
  } = props;
  const {
    colors,
    positions,
    mode,
    localMatrix,
    flags
  } = processGradientProps(ctx.Skia, props);
  const shader = ctx.Skia.Shader.MakeSweepGradient(c.x, c.y, colors, positions, mode, localMatrix, flags, start, end);
  ctx.shaders.push(shader);
};
const declareLinearGradientShader = (ctx, props) => {
  "worklet";

  const {
    start,
    end
  } = props;
  const {
    colors,
    positions,
    mode,
    localMatrix,
    flags
  } = processGradientProps(ctx.Skia, props);
  const shader = ctx.Skia.Shader.MakeLinearGradient(start, end, colors, positions !== null && positions !== void 0 ? positions : null, mode, localMatrix, flags);
  ctx.shaders.push(shader);
};
const declareTurbulenceShader = (ctx, props) => {
  "worklet";

  const {
    freqX,
    freqY,
    octaves,
    seed,
    tileWidth,
    tileHeight
  } = props;
  const shader = ctx.Skia.Shader.MakeTurbulence(freqX, freqY, octaves, seed, tileWidth, tileHeight);
  ctx.shaders.push(shader);
};
const declareImageShader = (ctx, props) => {
  "worklet";

  const {
    fit,
    image,
    tx,
    ty,
    sampling,
    ...imageShaderProps
  } = props;
  if (!image) {
    return;
  }
  const rct = getRect(ctx.Skia, imageShaderProps);
  const m3 = ctx.Skia.Matrix();
  if (rct) {
    const rects = fitRects(fit, {
      x: 0,
      y: 0,
      width: image.width(),
      height: image.height()
    }, rct);
    const [x, y, sx, sy] = rect2rect(rects.src, rects.dst);
    m3.translate(x.translateX, y.translateY);
    m3.scale(sx.scaleX, sy.scaleY);
  }
  const lm = ctx.Skia.Matrix();
  lm.concat(m3);
  processTransformProps(lm, imageShaderProps);
  let shader;
  if (sampling && isCubicSampling(sampling)) {
    shader = image.makeShaderCubic(TileMode[enumKey(tx)], TileMode[enumKey(ty)], sampling.B, sampling.C, lm);
  } else {
    var _sampling$filter, _sampling$mipmap;
    shader = image.makeShaderCubic(TileMode[enumKey(tx)], TileMode[enumKey(ty)], (_sampling$filter = sampling === null || sampling === void 0 ? void 0 : sampling.filter) !== null && _sampling$filter !== void 0 ? _sampling$filter : FilterMode.Linear, (_sampling$mipmap = sampling === null || sampling === void 0 ? void 0 : sampling.mipmap) !== null && _sampling$mipmap !== void 0 ? _sampling$mipmap : MipmapMode.None, lm);
  }
  ctx.shaders.push(shader);
};
const declareBlend = (ctx, props) => {
  "worklet";

  const blend = BlendMode[enumKey(props.mode)];
  const shaders = ctx.shaders.splice(0, ctx.shaders.length);
  if (shaders.length > 0) {
    const composer = ctx.Skia.Shader.MakeBlend.bind(ctx.Skia.Shader, blend);
    ctx.shaders.push(composeDeclarations(shaders, composer));
  }
};
export const isPushShader = command => {
  "worklet";

  return command.type === CommandType.PushShader;
};
const isShader = (command, type) => {
  "worklet";

  return command.shaderType === type;
};
export const pushShader = (ctx, command) => {
  "worklet";

  if (isShader(command, NodeType.Shader)) {
    declareShader(ctx, command.props);
  } else if (isShader(command, NodeType.ImageShader)) {
    declareImageShader(ctx, command.props);
  } else if (isShader(command, NodeType.ColorShader)) {
    declareColorShader(ctx, command.props);
  } else if (isShader(command, NodeType.Turbulence)) {
    declareTurbulenceShader(ctx, command.props);
  } else if (isShader(command, NodeType.FractalNoise)) {
    declareFractalNoiseShader(ctx, command.props);
  } else if (isShader(command, NodeType.LinearGradient)) {
    declareLinearGradientShader(ctx, command.props);
  } else if (isShader(command, NodeType.RadialGradient)) {
    declareRadialGradientShader(ctx, command.props);
  } else if (isShader(command, NodeType.SweepGradient)) {
    declareSweepGradientShader(ctx, command.props);
  } else if (isShader(command, NodeType.TwoPointConicalGradient)) {
    declareTwoPointConicalGradientShader(ctx, command.props);
  } else if (isShader(command, NodeType.Blend)) {
    declareBlend(ctx, command.props);
  } else {
    throw new Error(`Unknown shader type: ${command.shaderType}`);
  }
};
//# sourceMappingURL=Shaders.js.map