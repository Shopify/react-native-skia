import type { DrawingContext } from "../DrawingContext";
import type { SkMatrix, Vector, Transforms2d } from "../../skia/types";
import { processTransform } from "../../skia/types";

export interface TransformProps {
  transform?: Transforms2d;
  origin?: Vector;
  matrix?: SkMatrix;
}

export const processCanvasTransform = (
  { canvas, Skia }: DrawingContext,
  { transform, origin, matrix }: TransformProps
) => {
  if (transform) {
    if (matrix) {
      canvas.concat(matrix);
    } else {
      const m3 = processTransform(
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
    return processTransform(
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
