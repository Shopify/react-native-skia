"worklet";

import { enumKey } from "../../dom/nodes";
import type {
  BlendColorFilterProps,
  LerpColorFilterProps,
  MatrixColorFilterProps,
} from "../../dom/types";
import { BlendMode, type SkColorFilter } from "../../skia/types";
import type { DrawingContext } from "../DrawingContext";

const composeAndPush = (ctx: DrawingContext, cf1: SkColorFilter) => {
  const cf2 = ctx.declCtx.colorFilters.popAllAsOne();
  const cf = cf2 ? ctx.Skia.ColorFilter.MakeCompose(cf1, cf2) : cf1;
  ctx.declCtx.colorFilters.push(cf);
};

export const declareBlendColorFilter = (
  ctx: DrawingContext,
  props: BlendColorFilterProps
) => {
  const { mode } = props;
  const color = ctx.Skia.Color(props.color);
  const cf = ctx.Skia.ColorFilter.MakeBlend(color, BlendMode[enumKey(mode)]);
  composeAndPush(ctx, cf);
};

export const declareSRGBToLinearGammaColorFilter = (ctx: DrawingContext) => {
  const cf = ctx.Skia.ColorFilter.MakeSRGBToLinearGamma();
  composeAndPush(ctx, cf);
};

export const declareLinearToSRGBGammaColorFilter = (ctx: DrawingContext) => {
  const cf = ctx.Skia.ColorFilter.MakeLinearToSRGBGamma();
  composeAndPush(ctx, cf);
};

export const declareLerpColorFilter = (
  ctx: DrawingContext,
  props: LerpColorFilterProps
) => {
  const { t } = props;
  const second = ctx.declCtx.colorFilters.pop();
  const first = ctx.declCtx.colorFilters.pop();
  if (!first || !second) {
    throw new Error(
      "LerpColorFilterNode: missing two color filters as children"
    );
  }
  ctx.declCtx.colorFilters.push(
    ctx.Skia.ColorFilter.MakeLerp(t, first, second)
  );
};

export const declareMatrixColorFilter = (
  ctx: DrawingContext,
  props: MatrixColorFilterProps
) => {
  const { matrix } = props;
  const cf = ctx.Skia.ColorFilter.MakeMatrix(matrix);
  composeAndPush(ctx, cf);
};

export const declareLumaColorFilter = (ctx: DrawingContext) => {
  const cf = ctx.Skia.ColorFilter.MakeLumaColorFilter();
  composeAndPush(ctx, cf);
};
