import type { Skia, SkMatrix, Transforms2d, Vector } from "../../../skia/types";
import { processTransform, TileMode } from "../../../skia/types";
import type { GradientProps, TransformProps } from "../../types";

import { enumKey } from "./Enum";

export const transformOrigin = (origin: Vector, transform: Transforms2d) => [
  { translateX: origin.x },
  { translateY: origin.y },
  ...transform,
  { translateX: -origin.x },
  { translateY: -origin.y },
];

export const localMatrix = (
  m: SkMatrix,
  { transform, origin }: TransformProps
) => {
  if (transform) {
    return processTransform(
      m,
      origin ? transformOrigin(origin, transform) : transform
    );
  }
  return undefined;
};

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
