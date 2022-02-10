import type { DrawingContext } from "../DrawingContext";
import type { IMatrix } from "../../skia/Matrix";

import { neg, processTransform2d } from "./math";
import type { Transforms2d, Vector } from "./math";

export interface TransformProps {
  transform?: Transforms2d;
  origin?: Vector;
  matrix?: IMatrix;
}

export const processTransform = (
  { canvas }: DrawingContext,
  { transform, origin, matrix }: TransformProps
) => {
  if (transform) {
    if (matrix) {
      canvas.concat(matrix);
    } else {
      const m3 = processTransform2d(
        origin ? transformOrigin(origin, transform) : transform
      );
      canvas.concat(m3);
    }
  }
};

export const localMatrix = ({ transform, origin }: TransformProps) => {
  if (transform) {
    return processTransform2d(
      origin ? transformOrigin(origin, transform) : transform
    );
  }
  return undefined;
};

const translate = (a: Vector) => [{ translateX: a.x }, { translateY: a.y }];

export const transformOrigin = (origin: Vector, transform: Transforms2d) => [
  ...translate(origin),
  ...transform,
  ...translate(neg(origin)),
];
