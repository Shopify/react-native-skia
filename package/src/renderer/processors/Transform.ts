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
  if (matrix) {
    if (origin) {
      const m3 = Skia.Matrix();
      m3.translate(origin.x, origin.y);
      m3.concat(matrix);
      m3.translate(-origin.x, -origin.y);
      canvas.concat(m3);
    } else {
      canvas.concat(matrix);
    }
  } else if (transform) {
    const m3 = processTransform(
      Skia.Matrix(),
      origin ? transformOrigin(origin, transform) : transform
    );
    canvas.concat(m3);
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
