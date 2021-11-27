import { TileMode } from "../../../skia";
import type { SkEnum } from "../processors/Paint";
import type { TransformProps } from "../processors/Transform";
import { processColor, enumKey } from "../processors/Paint";
import { localMatrix } from "../processors/Transform";

export interface GradientProps extends TransformProps {
  colors: string[];
  positions?: number[];
  mode?: SkEnum<typeof TileMode>;
  flags?: number;
}

export const processGradientProps = ({
  colors,
  positions,
  mode,
  flags,
  ...transform
}: GradientProps) => ({
  colors: colors.map((color) => processColor(color, 1)),
  positions: positions ?? null,
  mode: TileMode[enumKey(mode ?? "clamp")],
  flags,
  localMatrix: localMatrix(transform),
});
