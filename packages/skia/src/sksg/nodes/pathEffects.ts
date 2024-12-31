"worklet";

import { enumKey, processPath } from "../../dom/nodes";
import type {
  CornerPathEffectProps,
  DashPathEffectProps,
  DiscretePathEffectProps,
  Line2DPathEffectProps,
  Path1DPathEffectProps,
  Path2DPathEffectProps,
} from "../../dom/types";
import type { SkPathEffect } from "../../skia/types";
import { Path1DEffectStyle } from "../../skia/types";
import {
  composeDeclarations,
  type DeclarationContext,
} from "../DeclarationContext";

export const composePathEffects = (
  ctx: DeclarationContext,
  pe: SkPathEffect,
  processChildren: () => void
) => {
  const { Skia } = ctx;
  ctx.save();
  processChildren();
  const pe1 = ctx.pathEffects.popAllAsOne();
  ctx.restore();
  ctx.pathEffects.push(pe1 ? Skia.PathEffect.MakeCompose(pe, pe1) : pe);
};

export const makeDiscretePathEffect = (
  ctx: DeclarationContext,
  props: DiscretePathEffectProps
) => {
  const { length, deviation, seed } = props;
  return ctx.Skia.PathEffect.MakeDiscrete(length, deviation, seed);
};

export const makePath2DPathEffect = (
  ctx: DeclarationContext,
  props: Path2DPathEffectProps
) => {
  const { matrix } = props;
  const path = processPath(ctx.Skia, props.path);
  const pe = ctx.Skia.PathEffect.MakePath2D(matrix, path);
  if (pe === null) {
    throw new Error("Path2DPathEffect: invalid path");
  }
  return pe;
};

export const makeDashPathEffect = (
  ctx: DeclarationContext,
  props: DashPathEffectProps
) => {
  const { intervals, phase } = props;
  const pe = ctx.Skia.PathEffect.MakeDash(intervals, phase);
  return pe;
};

export const makeCornerPathEffect = (
  ctx: DeclarationContext,
  props: CornerPathEffectProps
) => {
  const { r } = props;
  const pe = ctx.Skia.PathEffect.MakeCorner(r);
  if (pe === null) {
    throw new Error("CornerPathEffect: couldn't create path effect");
  }
  return pe;
};

export const declareSumPathEffect = (ctx: DeclarationContext) => {
  // Note: decorateChildren functionality needs to be handled differently
  const pes = ctx.pathEffects.popAll();
  const pe = composeDeclarations(
    pes,
    ctx.Skia.PathEffect.MakeSum.bind(ctx.Skia.PathEffect)
  );
  ctx.pathEffects.push(pe);
};

export const makeLine2DPathEffect = (
  ctx: DeclarationContext,
  props: Line2DPathEffectProps
) => {
  const { width, matrix } = props;
  const pe = ctx.Skia.PathEffect.MakeLine2D(width, matrix);
  if (pe === null) {
    throw new Error("Line2DPathEffect: could not create path effect");
  }
  return pe;
};

export const makePath1DPathEffect = (
  ctx: DeclarationContext,
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
  return pe;
};
