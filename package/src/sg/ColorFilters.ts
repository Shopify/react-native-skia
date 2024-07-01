import type {
  BlendColorFilterProps,
  ChildrenProps,
  LerpColorFilterProps,
  MatrixColorFilterProps,
} from "../dom/types";

import type { DrawingContext } from "./Context";

export const renderMatrixColorFilter = (
  _ctx: DrawingContext,
  _props: MatrixColorFilterProps
) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderBlendColorFilter = (
  _ctx: DrawingContext,
  _props: BlendColorFilterProps
) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderLinearToSRGBGammaColorFilter = (
  _ctx: DrawingContext,
  _props: ChildrenProps
) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderSRGBToLinearGammaColorFilter = (
  _ctx: DrawingContext,
  _props: ChildrenProps
) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderLerpColorFilter = (
  _ctx: DrawingContext,
  _props: LerpColorFilterProps
) => {
  "worklet";
  throw new Error("Not implemented");
};
