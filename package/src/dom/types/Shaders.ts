import type { Color, TileMode, Vector } from "../../skia/types";

import type { SkEnum, TransformProps } from "./Common";

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
