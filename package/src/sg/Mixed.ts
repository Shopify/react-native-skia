import type { BlendProps, BoxProps, BoxShadowProps } from "../dom/types";
import type { BackdropFilterProps } from "../renderer";

import type { DrawingContext } from "./Context";

export const renderBlend = (_ctx: DrawingContext, _props: BlendProps) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderBackdropFilter = (
  _ctx: DrawingContext,
  _props: BackdropFilterProps
) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderBox = (_ctx: DrawingContext, _props: BoxProps) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderBoxShadow = (
  _ctx: DrawingContext,
  _props: BoxShadowProps
) => {
  "worklet";
  throw new Error("Not implemented");
};
