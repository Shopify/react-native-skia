import type {
  ColorProps,
  DiscretePathEffectProps,
  ImageShaderProps,
  LinearGradientProps,
  RadialGradientProps,
  ShaderProps,
  SweepGradientProps,
  TurbulenceProps,
  TwoPointConicalGradientProps,
} from "../dom/types";

import type { DrawingContext } from "./Context";

export const renderShader = (_ctx: DrawingContext, _props: ShaderProps) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderImageShader = (
  _ctx: DrawingContext,
  _props: ImageShaderProps
) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderColorShader = (_ctx: DrawingContext, _props: ColorProps) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderTurbulence = (
  _ctx: DrawingContext,
  _props: TurbulenceProps
) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderFractalNoise = (
  _ctx: DrawingContext,
  _props: TurbulenceProps
) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderLinearGradient = (
  _ctx: DrawingContext,
  _props: LinearGradientProps
) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderRadialGradient = (
  _ctx: DrawingContext,
  _props: RadialGradientProps
) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderSweepGradient = (
  _ctx: DrawingContext,
  _props: SweepGradientProps
) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderTwoPointConicalGradient = (
  _ctx: DrawingContext,
  _props: TwoPointConicalGradientProps
) => {
  "worklet";
  throw new Error("Not implemented");
};
