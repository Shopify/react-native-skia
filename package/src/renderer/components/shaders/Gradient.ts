import { TileMode } from "../../../skia/types";
import type { Color, Skia } from "../../../skia/types";
import type { SkEnum, TransformProps } from "../../../dom/types";
import { enumKey, localMatrix } from "../../../dom/nodes/datatypes";

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
