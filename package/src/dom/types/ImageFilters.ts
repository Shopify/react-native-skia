import type { TileMode } from "../../skia/types";

import type { Radius, SkEnum, ChildrenProps } from "./Common";

export interface BlurImageFilterProps extends ChildrenProps {
  blur: Radius;
  mode: SkEnum<typeof TileMode>;
}
