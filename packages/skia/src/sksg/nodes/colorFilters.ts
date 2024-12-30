"worklet";

import { enumKey } from "../../dom/nodes";
import type {
  BlendColorFilterProps,
  DeclarationContext,
  LerpColorFilterProps,
  MatrixColorFilterProps,
} from "../../dom/types";
import type { SkColorFilter } from "../../skia/types";
import { BlendMode } from "../../skia/types";

export const composeColorFilters = (
  ctx: DeclarationContext,
  cf: SkColorFilter,
  processChildren: () => void
) => {
  const { Skia } = ctx;
  ctx.save();
  processChildren();
  const cf1 = ctx.colorFilters.popAllAsOne();
  ctx.restore();
  ctx.colorFilters.push(cf1 ? Skia.ColorFilter.MakeCompose(cf, cf1) : cf);
};

export const makeBlendColorFilter = (
  ctx: DeclarationContext,
  props: BlendColorFilterProps
) => {
  const { mode } = props;
  const color = ctx.Skia.Color(props.color);
  const cf = ctx.Skia.ColorFilter.MakeBlend(color, BlendMode[enumKey(mode)]);
  return cf;
};

export const makeSRGBToLinearGammaColorFilter = (ctx: DeclarationContext) => {
  const cf = ctx.Skia.ColorFilter.MakeSRGBToLinearGamma();
  return cf;
};

export const makeLinearToSRGBGammaColorFilter = (ctx: DeclarationContext) => {
  const cf = ctx.Skia.ColorFilter.MakeLinearToSRGBGamma();
  return cf;
};

export const declareLerpColorFilter = (
  ctx: DeclarationContext,
  props: LerpColorFilterProps
) => {
  const { t } = props;
  const second = ctx.colorFilters.pop();
  const first = ctx.colorFilters.pop();
  if (!first || !second) {
    throw new Error(
      "LerpColorFilterNode: missing two color filters as children"
    );
  }
  const cf = ctx.Skia.ColorFilter.MakeLerp(t, first, second);
  ctx.colorFilters.push(cf);
};

export const makeMatrixColorFilter = (
  ctx: DeclarationContext,
  props: MatrixColorFilterProps
) => {
  const { matrix } = props;
  const cf = ctx.Skia.ColorFilter.MakeMatrix(matrix);
  return cf;
};

export const makeLumaColorFilter = (ctx: DeclarationContext) => {
  const cf = ctx.Skia.ColorFilter.MakeLumaColorFilter();
  return cf;
};
