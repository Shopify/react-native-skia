import type { DrawingContext } from "../DrawingContext";
import type { SkMatrix, Vector } from "../../skia/types";

import { processTransform2d } from "./math";
import type { Transforms2d } from "./math";

export interface TransformProps {
  transform?: Transforms2d;
  origin?: Vector;
  matrix?: SkMatrix;
}

export const processTransform = (
  { canvas, Skia }: DrawingContext,
  { transform, origin, matrix }: TransformProps
) => {
  if (transform) {
    if (matrix) {
      canvas.concat(matrix);
    } else {
      const m3 = processTransform2d(
        Skia.Matrix(),
        origin ? transformOrigin(origin, transform) : transform
      );
      canvas.concat(m3);
    }
  }
};

export const localMatrix = (
  m: SkMatrix,
  { transform, origin }: TransformProps
) => {
  if (transform) {
    return processTransform2d(
      m,
      origin ? transformOrigin(origin, transform) : transform
    );
  }
  return undefined;
};

export const transformOrigin = (origin: Vector, transform: Transforms2d) => [
  { translateX: origin.x },
  { translateY: origin.y },
  ...transform,
  { translateX: -origin.x },
  { translateY: -origin.y },
];
