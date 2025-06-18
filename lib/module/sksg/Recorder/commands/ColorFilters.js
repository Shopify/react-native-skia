import { enumKey, processColor } from "../../../dom/nodes";
import { NodeType } from "../../../dom/types";
import { BlendMode } from "../../../skia/types";
import { CommandType } from "../Core";
export const isPushColorFilter = command => {
  "worklet";

  return command.type === CommandType.PushColorFilter;
};
const isColorFilter = (command, type) => {
  "worklet";

  return command.colorFilterType === type;
};
export const composeColorFilters = ctx => {
  "worklet";

  if (ctx.colorFilters.length > 1) {
    const outer = ctx.colorFilters.pop();
    const inner = ctx.colorFilters.pop();
    ctx.colorFilters.push(ctx.Skia.ColorFilter.MakeCompose(outer, inner));
  }
};
export const pushColorFilter = (ctx, command) => {
  "worklet";

  let cf;
  if (isColorFilter(command, NodeType.BlendColorFilter)) {
    const {
      props
    } = command;
    const {
      mode
    } = props;
    const color = processColor(ctx.Skia, props.color);
    cf = ctx.Skia.ColorFilter.MakeBlend(color, BlendMode[enumKey(mode)]);
  } else if (isColorFilter(command, NodeType.MatrixColorFilter)) {
    const {
      matrix
    } = command.props;
    cf = ctx.Skia.ColorFilter.MakeMatrix(matrix);
  } else if (isColorFilter(command, NodeType.LerpColorFilter)) {
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
  } else if (isColorFilter(command, NodeType.LumaColorFilter)) {
    cf = ctx.Skia.ColorFilter.MakeLumaColorFilter();
  } else if (isColorFilter(command, NodeType.LinearToSRGBGammaColorFilter)) {
    cf = ctx.Skia.ColorFilter.MakeLinearToSRGBGamma();
  } else if (isColorFilter(command, NodeType.SRGBToLinearGammaColorFilter)) {
    cf = ctx.Skia.ColorFilter.MakeSRGBToLinearGamma();
  }
  if (!cf) {
    throw new Error(`Unknown color filter type: ${command.colorFilterType}`);
  }
  ctx.colorFilters.push(cf);
};
//# sourceMappingURL=ColorFilters.js.map