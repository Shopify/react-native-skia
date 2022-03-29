import type { DrawingContext } from "../DrawingContext";
import type { SkMatrix } from "../../skia/Matrix";

import { neg, processTransform2d } from "./math";
import type { Transforms2d, Vector } from "./math";

export interface TransformProps {
  x?: number;
  y?: number;
  transform?: Transforms2d;
  origin?: Vector;
  matrix?: SkMatrix;
}

export const processTransform = (
  { canvas }: DrawingContext,
  { transform, origin, matrix, x, y }: TransformProps
) => {
  if (transform || x || y) {
    if (matrix) {
      canvas.concat(matrix);
    } else {
      let tr: Transforms2d = [];
      if (x) {
        tr = [{ translateX: x }];
      }
      if (y) {
        tr = [...tr, { translateY: y }];
      }
      if (transform) {
        tr = [...tr, ...transform];
      }
      const m3 = processTransform2d(origin ? transformOrigin(origin, tr) : tr);
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
