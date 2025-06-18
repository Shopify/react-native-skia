"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pushShader = exports.isPushShader = void 0;
var _nodes = require("../../../dom/nodes");
var _types = require("../../../dom/types");
var _types2 = require("../../../skia/types");
var _utils = require("../../utils");
var _Core = require("../Core");
const declareShader = (ctx, props) => {
  "worklet";

  const {
    source,
    uniforms,
    ...transform
  } = props;
  const m3 = ctx.Skia.Matrix();
  (0, _nodes.processTransformProps)(m3, transform);
  const shader = source.makeShaderWithChildren((0, _types2.processUniforms)(source, uniforms), ctx.shaders.splice(0, ctx.shaders.length), m3);
  ctx.shaders.push(shader);
};
const declareColorShader = (ctx, props) => {
  "worklet";

  const {
    color
  } = props;
  const shader = ctx.Skia.Shader.MakeColor((0, _nodes.processColor)(ctx.Skia, color));
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
  } = (0, _nodes.processGradientProps)(ctx.Skia, props);
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
  } = (0, _nodes.processGradientProps)(ctx.Skia, props);
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
  } = (0, _nodes.processGradientProps)(ctx.Skia, props);
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
  } = (0, _nodes.processGradientProps)(ctx.Skia, props);
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
  const rct = (0, _nodes.getRect)(ctx.Skia, imageShaderProps);
  const m3 = ctx.Skia.Matrix();
  if (rct) {
    const rects = (0, _nodes.fitRects)(fit, {
      x: 0,
      y: 0,
      width: image.width(),
      height: image.height()
    }, rct);
    const [x, y, sx, sy] = (0, _nodes.rect2rect)(rects.src, rects.dst);
    m3.translate(x.translateX, y.translateY);
    m3.scale(sx.scaleX, sy.scaleY);
  }
  const lm = ctx.Skia.Matrix();
  lm.concat(m3);
  (0, _nodes.processTransformProps)(lm, imageShaderProps);
  let shader;
  if (sampling && (0, _types2.isCubicSampling)(sampling)) {
    shader = image.makeShaderCubic(_types2.TileMode[(0, _nodes.enumKey)(tx)], _types2.TileMode[(0, _nodes.enumKey)(ty)], sampling.B, sampling.C, lm);
  } else {
    var _sampling$filter, _sampling$mipmap;
    shader = image.makeShaderCubic(_types2.TileMode[(0, _nodes.enumKey)(tx)], _types2.TileMode[(0, _nodes.enumKey)(ty)], (_sampling$filter = sampling === null || sampling === void 0 ? void 0 : sampling.filter) !== null && _sampling$filter !== void 0 ? _sampling$filter : _types2.FilterMode.Linear, (_sampling$mipmap = sampling === null || sampling === void 0 ? void 0 : sampling.mipmap) !== null && _sampling$mipmap !== void 0 ? _sampling$mipmap : _types2.MipmapMode.None, lm);
  }
  ctx.shaders.push(shader);
};
const declareBlend = (ctx, props) => {
  "worklet";

  const blend = _types2.BlendMode[(0, _nodes.enumKey)(props.mode)];
  const shaders = ctx.shaders.splice(0, ctx.shaders.length);
  if (shaders.length > 0) {
    const composer = ctx.Skia.Shader.MakeBlend.bind(ctx.Skia.Shader, blend);
    ctx.shaders.push((0, _utils.composeDeclarations)(shaders, composer));
  }
};
const isPushShader = command => {
  "worklet";

  return command.type === _Core.CommandType.PushShader;
};
exports.isPushShader = isPushShader;
const isShader = (command, type) => {
  "worklet";

  return command.shaderType === type;
};
const pushShader = (ctx, command) => {
  "worklet";

  if (isShader(command, _types.NodeType.Shader)) {
    declareShader(ctx, command.props);
  } else if (isShader(command, _types.NodeType.ImageShader)) {
    declareImageShader(ctx, command.props);
  } else if (isShader(command, _types.NodeType.ColorShader)) {
    declareColorShader(ctx, command.props);
  } else if (isShader(command, _types.NodeType.Turbulence)) {
    declareTurbulenceShader(ctx, command.props);
  } else if (isShader(command, _types.NodeType.FractalNoise)) {
    declareFractalNoiseShader(ctx, command.props);
  } else if (isShader(command, _types.NodeType.LinearGradient)) {
    declareLinearGradientShader(ctx, command.props);
  } else if (isShader(command, _types.NodeType.RadialGradient)) {
    declareRadialGradientShader(ctx, command.props);
  } else if (isShader(command, _types.NodeType.SweepGradient)) {
    declareSweepGradientShader(ctx, command.props);
  } else if (isShader(command, _types.NodeType.TwoPointConicalGradient)) {
    declareTwoPointConicalGradientShader(ctx, command.props);
  } else if (isShader(command, _types.NodeType.Blend)) {
    declareBlend(ctx, command.props);
  } else {
    throw new Error(`Unknown shader type: ${command.shaderType}`);
  }
};
exports.pushShader = pushShader;
//# sourceMappingURL=Shaders.js.map