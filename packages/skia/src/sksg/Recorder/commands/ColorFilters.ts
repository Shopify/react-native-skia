"worklet";

import { enumKey } from "../../../dom/nodes";
import type {
  BlendColorFilterProps,
  LerpColorFilterProps,
  MatrixColorFilterProps,
} from "../../../dom/types";
import { NodeType } from "../../../dom/types";
import type { SkColorFilter } from "../../../skia/types";
import { BlendMode } from "../../../skia/types";
import { CommandType } from "../Core";
import type { Command } from "../Core";
import type { DrawingContext } from "../DrawingContext";

export const isPushColorFilter = (
  command: Command
): command is Command<CommandType.PushColorFilter> => {
  return command.type === CommandType.PushColorFilter;
};

type Props = {
  [NodeType.BlendColorFilter]: BlendColorFilterProps;
  [NodeType.MatrixColorFilter]: MatrixColorFilterProps;
  [NodeType.LerpColorFilter]: LerpColorFilterProps;
  [NodeType.LumaColorFilter]: Record<string, never>;
  [NodeType.LinearToSRGBGammaColorFilter]: Record<string, never>;
  [NodeType.SRGBToLinearGammaColorFilter]: Record<string, never>;
};

interface PushColorFilter<T extends keyof Props>
  extends Command<CommandType.PushColorFilter> {
  colorFilterType: T;
  props: Props[T];
}

const isBlendColorFilter = (
  command: Command<CommandType.PushColorFilter>
): command is PushColorFilter<NodeType.BlendColorFilter> => {
  return command.colorFilterType === NodeType.BlendColorFilter;
};

const isMatrixColorFilter = (
  command: Command<CommandType.PushColorFilter>
): command is PushColorFilter<NodeType.MatrixColorFilter> => {
  return command.colorFilterType === NodeType.MatrixColorFilter;
};

const isLerpColorFilter = (
  command: Command<CommandType.PushColorFilter>
): command is PushColorFilter<NodeType.LerpColorFilter> => {
  return command.colorFilterType === NodeType.LerpColorFilter;
};

const isLumaColorFilter = (
  command: Command<CommandType.PushColorFilter>
): command is PushColorFilter<NodeType.LumaColorFilter> => {
  return command.colorFilterType === NodeType.LumaColorFilter;
};

const isLinearToSRGBGammaColorFilter = (
  command: Command<CommandType.PushColorFilter>
): command is PushColorFilter<NodeType.LinearToSRGBGammaColorFilter> => {
  return command.colorFilterType === NodeType.LinearToSRGBGammaColorFilter;
};

const isSRGBToLinearGammaColorFilter = (
  command: Command<CommandType.PushColorFilter>
): command is PushColorFilter<NodeType.SRGBToLinearGammaColorFilter> => {
  return command.colorFilterType === NodeType.SRGBToLinearGammaColorFilter;
};

export const composeColorFilters = (ctx: DrawingContext) => {
  if (ctx.colorFilters.length > 1) {
    const outer = ctx.colorFilters.pop()!;
    const inner = ctx.colorFilters.pop()!;
    ctx.colorFilters.push(ctx.Skia.ColorFilter.MakeCompose(outer, inner));
  }
};

export const setColorFilters = (ctx: DrawingContext) => {
  if (ctx.colorFilters.length > 0) {
    ctx.paint.setColorFilter(
      ctx.colorFilters.reduceRight((inner, outer) =>
        inner ? ctx.Skia.ColorFilter.MakeCompose(outer, inner) : outer
      )
    );
  }
};

export const pushColorFilter = (
  ctx: DrawingContext,
  command: Command<CommandType.PushColorFilter>
) => {
  let cf: SkColorFilter | undefined;
  if (isBlendColorFilter(command)) {
    const { props } = command;
    const { mode } = props;
    const color = ctx.Skia.Color(props.color);
    cf = ctx.Skia.ColorFilter.MakeBlend(color, BlendMode[enumKey(mode)]);
  } else if (isMatrixColorFilter(command)) {
    const { matrix } = command.props;
    cf = ctx.Skia.ColorFilter.MakeMatrix(matrix);
  } else if (isLerpColorFilter(command)) {
    const { props } = command;
    const { t } = props;
    const second = ctx.colorFilters.pop();
    const first = ctx.colorFilters.pop();
    if (!first || !second) {
      throw new Error("LerpColorFilter requires two color filters");
    }
    cf = ctx.Skia.ColorFilter.MakeLerp(t, first, second);
  } else if (isLumaColorFilter(command)) {
    cf = ctx.Skia.ColorFilter.MakeLumaColorFilter();
  } else if (isLinearToSRGBGammaColorFilter(command)) {
    cf = ctx.Skia.ColorFilter.MakeLinearToSRGBGamma();
  } else if (isSRGBToLinearGammaColorFilter(command)) {
    cf = ctx.Skia.ColorFilter.MakeSRGBToLinearGamma();
  }
  if (!cf) {
    throw new Error(`Unknown color filter type: ${command.colorFilterType}`);
  }
  ctx.colorFilters.push(cf);
};
