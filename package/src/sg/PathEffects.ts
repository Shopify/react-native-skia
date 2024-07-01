import type {
  CornerPathEffectProps,
  DashPathEffectProps,
  DiscretePathEffectProps,
  Path1DPathEffectProps,
  Path2DPathEffectProps,
} from "../dom/types";

import type { DrawingContext } from "./Context";

export const renderDiscretePathEffect = (
  _ctx: DrawingContext,
  _props: DiscretePathEffectProps
) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderDashPathEffect = (
  _ctx: DrawingContext,
  _props: DashPathEffectProps
) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderPath1DPathEffect = (
  _ctx: DrawingContext,
  _props: Path1DPathEffectProps
) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderPath2DPathEffect = (
  _ctx: DrawingContext,
  _props: Path2DPathEffectProps
) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderCornerPathEffect = (
  _ctx: DrawingContext,
  _props: CornerPathEffectProps
) => {
  "worklet";
  throw new Error("Not implemented");
};
