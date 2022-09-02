import type {
  Color,
  FilterMode,
  MipmapMode,
  SkImage,
  SkRect,
  SkRuntimeEffect,
  TileMode,
  Uniforms,
  Vector,
} from "../../skia/types";

import type {
  SkEnum,
  TransformProps,
  ChildrenProps,
  RectCtor,
  Fit,
} from "./Common";

export interface ShaderProps extends TransformProps, ChildrenProps {
  source: SkRuntimeEffect;
  uniforms: Uniforms;
}

export interface ImageShaderProps extends TransformProps, Partial<RectCtor> {
  tx: SkEnum<typeof TileMode>;
  ty: SkEnum<typeof TileMode>;
  fm: SkEnum<typeof FilterMode>;
  mm: SkEnum<typeof MipmapMode>;
  fit: Fit;
  rect?: SkRect;
  image: SkImage;
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
