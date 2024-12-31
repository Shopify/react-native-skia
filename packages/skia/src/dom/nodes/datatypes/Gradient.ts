import type { Skia, SkRect, Transforms3d, Vector } from "../../../skia/types";
import { TileMode } from "../../../skia/types";
import type { GradientProps, ImageShaderProps } from "../../types";

import { enumKey } from "./Enum";
import { processTransformProps } from "./Transform";

export const transformOrigin = (origin: Vector, transform: Transforms3d) => {
  "worklet";
  return [
    { translateX: origin.x },
    { translateY: origin.y },
    ...transform,
    { translateX: -origin.x },
    { translateY: -origin.y },
  ];
};

export const processGradientProps = (
  Skia: Skia,
  { colors, positions, mode, flags, ...transform }: GradientProps
) => {
  "worklet";
  const localMatrix = Skia.Matrix();
  processTransformProps(localMatrix, transform);
  return {
    colors: colors.map((color) => Skia.Color(color)),
    positions: positions ?? null,
    mode: TileMode[enumKey(mode ?? "clamp")],
    flags,
    localMatrix,
  };
};

export const getRect = (
  Skia: Skia,
  props: Omit<ImageShaderProps, "tx" | "ty" | "fm" | "mm" | "fit" | "image">
): SkRect | undefined => {
  "worklet";
  const { x, y, width, height } = props;
  if (props.rect) {
    return props.rect;
  } else if (width !== undefined && height !== undefined) {
    return Skia.XYWHRect(x ?? 0, y ?? 0, width, height);
  } else {
    return undefined;
  }
};
