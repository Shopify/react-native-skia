import { TileMode } from "../../../skia/types";
import type { SkEnum } from "../../processors/Paint";
import type { TransformProps } from "../../processors/Transform";
import { enumKey } from "../../processors/Paint";
import { localMatrix } from "../../processors/Transform";
import type { Color, Skia } from "../../../skia/types";

export interface GradientProps extends TransformProps {
  colors: Color[];
  positions?: number[];
  mode?: SkEnum<typeof TileMode>;
  flags?: number;
}

export const processGradientProps = (
  Skia: Skia,
  { colors, positions, mode, flags, ...transform }: GradientProps
) => ({
  colors: colors.map((color) => Skia.Color(color)),
  positions: positions ?? null,
  mode: TileMode[enumKey(mode ?? "clamp")],
  flags,
  localMatrix: localMatrix(Skia.Matrix(), transform),
});
