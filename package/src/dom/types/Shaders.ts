import type {
  Color,
  SkRuntimeEffect,
  TileMode,
  Uniforms,
  Vector,
} from "../../skia/types";

import type { SkEnum, TransformProps, ChildrenProps } from "./Common";

export interface ShaderProps extends TransformProps, ChildrenProps {
  source: SkRuntimeEffect;
  uniforms: Uniforms;
}

export interface GradientProps extends TransformProps {
  colors: Color[];
  positions?: number[];
  mode?: SkEnum<typeof TileMode>;
  flags?: number;
}

export interface LinearGradientProps extends GradientProps {
  start: Vector;
  end: Vector;
}
