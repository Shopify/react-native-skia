import type {
  BlendMode,
  SkRuntimeEffect,
  TileMode,
  Uniforms,
} from "../../skia/types";

import type { Radius, SkEnum, ChildrenProps } from "./Common";

export interface BlurImageFilterProps extends ChildrenProps {
  blur: Radius;
  mode: SkEnum<typeof TileMode>;
}

export interface OffsetImageFilterProps extends ChildrenProps {
  x: number;
  y: number;
}

export interface RuntimeShaderImageFilterProps {
  source: SkRuntimeEffect;
  uniforms?: Uniforms;
}

export interface BlendProps {
  mode: BlendMode;
}
