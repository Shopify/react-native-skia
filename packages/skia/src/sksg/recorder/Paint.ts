import type { SkEnum } from "../../dom/types";
import type { BlendMode, Color } from "../../skia/types";

export interface PaintProps {
  color?: Color;
  opacity?: number;
  blendMode?: SkEnum<typeof BlendMode>;
}
