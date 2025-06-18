"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pushColorFilter = exports.isPushColorFilter = exports.composeColorFilters = void 0;
var _nodes = require("../../../dom/nodes");
var _types = require("../../../dom/types");
var _types2 = require("../../../skia/types");
var _Core = require("../Core");
const isPushColorFilter = command => {
  "worklet";

  return command.type === _Core.CommandType.PushColorFilter;
};
exports.isPushColorFilter = isPushColorFilter;
const isColorFilter = (command, type) => {
  "worklet";

  return command.colorFilterType === type;
};
const composeColorFilters = ctx => {
  "worklet";

  if (ctx.colorFilters.length > 1) {
    const outer = ctx.colorFilters.pop();
    const inner = ctx.colorFilters.pop();
    ctx.colorFilters.push(ctx.Skia.ColorFilter.MakeCompose(outer, inner));
  }
};
exports.composeColorFilters = composeColorFilters;
const pushColorFilter = (ctx, command) => {
  "worklet";

  let cf;
  if (isColorFilter(command, _types.NodeType.BlendColorFilter)) {
    const {
      props
    } = command;
    const {
      mode
    } = props;
    const color = (0, _nodes.processColor)(ctx.Skia, props.color);
    cf = ctx.Skia.ColorFilter.MakeBlend(color, _types2.BlendMode[(0, _nodes.enumKey)(mode)]);
  } else if (isColorFilter(command, _types.NodeType.MatrixColorFilter)) {
    const {
      matrix
    } = command.props;
    cf = ctx.Skia.ColorFilter.MakeMatrix(matrix);
  } else if (isColorFilter(command, _types.NodeType.LerpColorFilter)) {
    const {
      props
    } = command;
    const {
      t
    } = props;
    const second = ctx.colorFilters.pop();
    const first = ctx.colorFilters.pop();
    if (!first || !second) {
      throw new Error("LerpColorFilter requires two color filters");
    }
    cf = ctx.Skia.ColorFilter.MakeLerp(t, first, second);
  } else if (isColorFilter(command, _types.NodeType.LumaColorFilter)) {
    cf = ctx.Skia.ColorFilter.MakeLumaColorFilter();
  } else if (isColorFilter(command, _types.NodeType.LinearToSRGBGammaColorFilter)) {
    cf = ctx.Skia.ColorFilter.MakeLinearToSRGBGamma();
  } else if (isColorFilter(command, _types.NodeType.SRGBToLinearGammaColorFilter)) {
    cf = ctx.Skia.ColorFilter.MakeSRGBToLinearGamma();
  }
  if (!cf) {
    throw new Error(`Unknown color filter type: ${command.colorFilterType}`);
  }
  ctx.colorFilters.push(cf);
};
exports.pushColorFilter = pushColorFilter;
//# sourceMappingURL=ColorFilters.js.map