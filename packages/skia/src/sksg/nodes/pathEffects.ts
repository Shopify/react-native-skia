"worklet";

import { composeDeclarations, enumKey, processPath } from "../../dom/nodes";
import type {
  CornerPathEffectProps,
  DashPathEffectProps,
  DeclarationContext,
  DiscretePathEffectProps,
  Line2DPathEffectProps,
  Path1DPathEffectProps,
  Path2DPathEffectProps,
} from "../../dom/types";
import { Path1DEffectStyle, type SkPathEffect } from "../../skia/types";
import type { DrawingContext } from "../DrawingContext";

const composeAndPush = (ctx: DeclarationContext, pe1: SkPathEffect) => {
  const pe2 = ctx.pathEffects.popAllAsOne();
  ctx.restore();
  const pe = pe2 ? ctx.Skia.PathEffect.MakeCompose(pe1, pe2) : pe1;
  ctx.pathEffects.push(pe);
};

export const declareDiscretePathEffect = (
  ctx: DrawingContext,
  props: DiscretePathEffectProps
) => {
  const { length, deviation, seed } = props;
  const pe = ctx.Skia.PathEffect.MakeDiscrete(length, deviation, seed);
  composeAndPush(ctx.declCtx, pe);
};

export const declarePath2DPathEffect = (
  ctx: DrawingContext,
  props: Path2DPathEffectProps
) => {
  const { matrix } = props;
  const path = processPath(ctx.Skia, props.path);
  const pe = ctx.Skia.PathEffect.MakePath2D(matrix, path);
  if (pe === null) {
    throw new Error("Path2DPathEffect: invalid path");
  }
  composeAndPush(ctx.declCtx, pe);
};

export const declareDashPathEffect = (
  ctx: DrawingContext,
  props: DashPathEffectProps
) => {
  const { intervals, phase } = props;
  const pe = ctx.Skia.PathEffect.MakeDash(intervals, phase);
  composeAndPush(ctx.declCtx, pe);
};

export const declareCornerPathEffect = (
  ctx: DrawingContext,
  props: CornerPathEffectProps
) => {
  const { r } = props;
  const pe = ctx.Skia.PathEffect.MakeCorner(r);
  if (pe === null) {
    throw new Error("CornerPathEffect: couldn't create path effect");
  }
  composeAndPush(ctx.declCtx, pe);
};

export const declareSumPathEffect = (ctx: DrawingContext) => {
  // Note: decorateChildren functionality needs to be handled differently
  const pes = ctx.declCtx.pathEffects.popAll();
  const pe = composeDeclarations(
    pes,
    ctx.Skia.PathEffect.MakeSum.bind(ctx.Skia.PathEffect)
  );
  ctx.declCtx.pathEffects.push(pe);
};

export const declareLine2DPathEffect = (
  ctx: DrawingContext,
  props: Line2DPathEffectProps
) => {
  const { width, matrix } = props;
  const pe = ctx.Skia.PathEffect.MakeLine2D(width, matrix);
  if (pe === null) {
    throw new Error("Line2DPathEffect: could not create path effect");
  }
  composeAndPush(ctx.declCtx, pe);
};

export const declarePath1DPathEffect = (
  ctx: DrawingContext,
  props: Path1DPathEffectProps
) => {
  const { advance, phase, style } = props;
  const path = processPath(ctx.Skia, props.path);
  const pe = ctx.Skia.PathEffect.MakePath1D(
    path,
    advance,
    phase,
    Path1DEffectStyle[enumKey(style)]
  );
  if (pe === null) {
    throw new Error("Path1DPathEffect: could not create path effect");
  }
  composeAndPush(ctx.declCtx, pe);
};
