import { enumKey, processPath } from "../../../dom/nodes";
import { NodeType } from "../../../dom/types";
import { Path1DEffectStyle } from "../../../skia/types";
import { composeDeclarations } from "../../utils";
import { CommandType } from "../Core";
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
  const path = processPath(ctx.Skia, props.path);
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
  const pe = composeDeclarations(pes, ctx.Skia.PathEffect.MakeSum.bind(ctx.Skia.PathEffect));
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
  const path = processPath(ctx.Skia, props.path);
  const pe = ctx.Skia.PathEffect.MakePath1D(path, advance, phase, Path1DEffectStyle[enumKey(style)]);
  if (pe === null) {
    throw new Error("Path1DPathEffect: could not create path effect");
  }
  ctx.pathEffects.push(pe);
};
export const isPushPathEffect = command => {
  "worklet";

  return command.type === CommandType.PushPathEffect;
};
const isPathEffect = (command, type) => {
  "worklet";

  return command.pathEffectType === type;
};
export const composePathEffects = ctx => {
  "worklet";

  if (ctx.pathEffects.length > 1) {
    const outer = ctx.pathEffects.pop();
    const inner = ctx.pathEffects.pop();
    ctx.pathEffects.push(ctx.Skia.PathEffect.MakeCompose(outer, inner));
  }
};
export const pushPathEffect = (ctx, command) => {
  "worklet";

  if (isPathEffect(command, NodeType.DiscretePathEffect)) {
    declareDiscretePathEffect(ctx, command.props);
  } else if (isPathEffect(command, NodeType.DashPathEffect)) {
    declareDashPathEffect(ctx, command.props);
  } else if (isPathEffect(command, NodeType.Path1DPathEffect)) {
    declarePath1DPathEffect(ctx, command.props);
  } else if (isPathEffect(command, NodeType.Path2DPathEffect)) {
    declarePath2DPathEffect(ctx, command.props);
  } else if (isPathEffect(command, NodeType.CornerPathEffect)) {
    declareCornerPathEffect(ctx, command.props);
  } else if (isPathEffect(command, NodeType.SumPathEffect)) {
    declareSumPathEffect(ctx);
  } else if (isPathEffect(command, NodeType.Line2DPathEffect)) {
    declareLine2DPathEffect(ctx, command.props);
  } else {
    throw new Error("Invalid image filter type: " + command.imageFilterType);
  }
};
//# sourceMappingURL=PathEffects.js.map