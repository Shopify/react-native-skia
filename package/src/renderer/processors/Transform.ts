import type { DrawingContext } from "../DrawingContext";

import { neg, skiaMatrix3, processTransform2d } from "./math";
import type { Transforms2d, Vector } from "./math";

// TODO: 1. Add support for supplying the matrix directly
// TODO: 2. Add direct constructor of the matrix via jsiskmatrix::fromValue
export interface TransformProps {
  transform?: Transforms2d;
  origin?: Vector;
}

export const processTransform = (
  { canvas }: DrawingContext,
  { transform, origin }: TransformProps
) => {
  if (transform) {
    const m3 = processTransform2d(
      origin ? transformOrigin(origin, transform) : transform
    );
    const sm = skiaMatrix3(m3);
    canvas.concat(sm);
  }
};

export const localMatrix = ({ transform, origin }: TransformProps) => {
  if (transform) {
    const m3 = processTransform2d(
      origin ? transformOrigin(origin, transform) : transform
    );
    return skiaMatrix3(m3);
  }
  return undefined;
};

const translate = (a: Vector) => [{ translateX: a.x }, { translateY: a.y }];

export const transformOrigin = (origin: Vector, transform: Transforms2d) => [
  ...translate(origin),
  ...transform,
  ...translate(neg(origin)),
];
