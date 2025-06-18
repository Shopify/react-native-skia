"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pushPathEffect = exports.isPushPathEffect = exports.composePathEffects = void 0;
var _nodes = require("../../../dom/nodes");
var _types = require("../../../dom/types");
var _types2 = require("../../../skia/types");
var _utils = require("../../utils");
var _Core = require("../Core");
const declareDiscretePathEffect = (ctx, props) => {
  "worklet";

  const {
    length,
    deviation,
    seed
  } = props;
  const pe = ctx.Skia.PathEffect.MakeDiscrete(length, deviation, seed);
  ctx.pathEffects.push(pe);
};
const declarePath2DPathEffect = (ctx, props) => {
  "worklet";

  const {
    matrix
  } = props;
  const path = (0, _nodes.processPath)(ctx.Skia, props.path);
  const pe = ctx.Skia.PathEffect.MakePath2D(matrix, path);
  if (pe === null) {
    throw new Error("Path2DPathEffect: invalid path");
  }
  ctx.pathEffects.push(pe);
};
const declareDashPathEffect = (ctx, props) => {
  "worklet";

  const {
    intervals,
    phase
  } = props;
  const pe = ctx.Skia.PathEffect.MakeDash(intervals, phase);
  ctx.pathEffects.push(pe);
};
const declareCornerPathEffect = (ctx, props) => {
  "worklet";

  const {
    r
  } = props;
  const pe = ctx.Skia.PathEffect.MakeCorner(r);
  if (pe === null) {
    throw new Error("CornerPathEffect: couldn't create path effect");
  }
  ctx.pathEffects.push(pe);
};
const declareSumPathEffect = ctx => {
  "worklet";

  // Note: decorateChildren functionality needs to be handled differently
  const pes = ctx.pathEffects.splice(0, ctx.pathEffects.length);
  const pe = (0, _utils.composeDeclarations)(pes, ctx.Skia.PathEffect.MakeSum.bind(ctx.Skia.PathEffect));
  ctx.pathEffects.push(pe);
};
const declareLine2DPathEffect = (ctx, props) => {
  "worklet";

  const {
    width,
    matrix
  } = props;
  const pe = ctx.Skia.PathEffect.MakeLine2D(width, matrix);
  if (pe === null) {
    throw new Error("Line2DPathEffect: could not create path effect");
  }
  ctx.pathEffects.push(pe);
};
const declarePath1DPathEffect = (ctx, props) => {
  "worklet";

  const {
    advance,
    phase,
    style
  } = props;
  const path = (0, _nodes.processPath)(ctx.Skia, props.path);
  const pe = ctx.Skia.PathEffect.MakePath1D(path, advance, phase, _types2.Path1DEffectStyle[(0, _nodes.enumKey)(style)]);
  if (pe === null) {
    throw new Error("Path1DPathEffect: could not create path effect");
  }
  ctx.pathEffects.push(pe);
};
const isPushPathEffect = command => {
  "worklet";

  return command.type === _Core.CommandType.PushPathEffect;
};
exports.isPushPathEffect = isPushPathEffect;
const isPathEffect = (command, type) => {
  "worklet";

  return command.pathEffectType === type;
};
const composePathEffects = ctx => {
  "worklet";

  if (ctx.pathEffects.length > 1) {
    const outer = ctx.pathEffects.pop();
    const inner = ctx.pathEffects.pop();
    ctx.pathEffects.push(ctx.Skia.PathEffect.MakeCompose(outer, inner));
  }
};
exports.composePathEffects = composePathEffects;
const pushPathEffect = (ctx, command) => {
  "worklet";

  if (isPathEffect(command, _types.NodeType.DiscretePathEffect)) {
    declareDiscretePathEffect(ctx, command.props);
  } else if (isPathEffect(command, _types.NodeType.DashPathEffect)) {
    declareDashPathEffect(ctx, command.props);
  } else if (isPathEffect(command, _types.NodeType.Path1DPathEffect)) {
    declarePath1DPathEffect(ctx, command.props);
  } else if (isPathEffect(command, _types.NodeType.Path2DPathEffect)) {
    declarePath2DPathEffect(ctx, command.props);
  } else if (isPathEffect(command, _types.NodeType.CornerPathEffect)) {
    declareCornerPathEffect(ctx, command.props);
  } else if (isPathEffect(command, _types.NodeType.SumPathEffect)) {
    declareSumPathEffect(ctx);
  } else if (isPathEffect(command, _types.NodeType.Line2DPathEffect)) {
    declareLine2DPathEffect(ctx, command.props);
  } else {
    throw new Error("Invalid image filter type: " + command.imageFilterType);
  }
};
exports.pushPathEffect = pushPathEffect;
//# sourceMappingURL=PathEffects.js.map