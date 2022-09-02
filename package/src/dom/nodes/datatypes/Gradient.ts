import type {
  Skia,
  SkMatrix,
  SkRect,
  Transforms2d,
  Vector,
} from "../../../skia/types";
import { processTransform, TileMode } from "../../../skia/types";
import type {
  GradientProps,
  ImageShaderProps,
  TransformProps,
} from "../../types";

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

export const getRect = (
  Skia: Skia,
  props: Omit<ImageShaderProps, "tx" | "ty" | "fm" | "mm" | "fit" | "image">
): SkRect | undefined => {
  const { x, y, width, height } = props;
  if (props.rect) {
    return props.rect;
  } else if (
    x !== undefined &&
    y !== undefined &&
    width !== undefined &&
    height !== undefined
  ) {
    return Skia.XYWHRect(x, y, width, height);
  } else {
    return undefined;
  }
};
