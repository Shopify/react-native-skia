import type { TileMode } from "../../skia/types";

import type { Radius, SkEnum, ChildrenProps } from "./Common";

export interface BlurImageFilterProps extends ChildrenProps {
  blur: Radius;
  mode: SkEnum<typeof TileMode>;
}

export interface OffsetImageFilterProps extends ChildrenProps {
  x: number;
  y: number;
}
