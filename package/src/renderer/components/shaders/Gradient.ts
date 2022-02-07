import { TileMode, Skia } from "../../../skia";
import type { SkEnum } from "../../processors/Paint";
import type { TransformProps } from "../../processors/Transform";
import { enumKey } from "../../processors/Paint";
import { localMatrix } from "../../processors/Transform";
import type { ColorProp } from "../../processors/Colors";

export interface GradientProps extends TransformProps {
  colors: ColorProp[];
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
  colors: colors.map((color) =>
    typeof color === "string" ? Skia.Color(color) : color
  ),
  positions: positions ?? null,
  mode: TileMode[enumKey(mode ?? "clamp")],
  flags,
  localMatrix: localMatrix(transform),
});
