import type {
  BlendImageFilterProps,
  BlurImageFilterProps,
  ChildrenProps,
  DisplacementMapImageFilterProps,
  DropShadowImageFilterProps,
  MorphologyImageFilterProps,
  OffsetImageFilterProps,
  RuntimeShaderImageFilterProps,
} from "../dom/types";

import type { DrawingContext } from "./Context";

export const renderBlendImageFilter = (
  _ctx: DrawingContext,
  _props: BlendImageFilterProps
) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderBlurImageFilter = (
  _ctx: DrawingContext,
  _props: BlurImageFilterProps
) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderOffsetImageFilter = (
  _ctx: DrawingContext,
  _props: OffsetImageFilterProps
) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderDropShadowImageFilter = (
  _ctx: DrawingContext,
  _props: DropShadowImageFilterProps
) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderDisplacementMapImageFilter = (
  _ctx: DrawingContext,
  _props: DisplacementMapImageFilterProps
) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderRuntimeShaderImageFilter = (
  _ctx: DrawingContext,
  _props: RuntimeShaderImageFilterProps
) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderMorphologyImageFilter = (
  _ctx: DrawingContext,
  _props: MorphologyImageFilterProps
) => {
  "worklet";
  throw new Error("Not implemented");
};

export const renderLumaColorFilter = (
  _ctx: DrawingContext,
  _props: ChildrenProps
) => {
  "worklet";
  throw new Error("Not implemented");
};
