import type { DrawingContext } from "../../CanvasKitView";
import type { Transforms2d } from "../../../skia/Matrix3Helper";
import { processTransform2d, skiaMatrix3 } from "../../../skia/Matrix3Helper";
import type { Vector } from "../../math";
import { neg } from "../../math";

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

const translate = (a: Vector) => [{ translateX: a.x }, { translateY: a.y }];

export const transformOrigin = (origin: Vector, transform: Transforms2d) => [
  ...translate(origin),
  ...transform,
  ...translate(neg(origin)),
];
