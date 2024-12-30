import type {
  SkContourMeasure,
  SkPath,
  SkRRect,
  SkRect,
  Vector,
} from "@shopify/react-native-skia";
import {
  fitbox,
  multiply4,
  scale,
  translate,
  rrect,
  rect,
  Skia,
} from "@shopify/react-native-skia";

import { CANVAS } from "./Theme";

export class PathGeometry {
  private totalLength = 0;
  private contours: { from: number; to: number; contour: SkContourMeasure }[] =
    [];

  constructor(path: SkPath, resScale = 1) {
    const it = Skia.ContourMeasureIter(path, false, resScale);
    let contour: SkContourMeasure | null;
    while ((contour = it.next())) {
      const from = this.totalLength;
      const to = from + contour.length();
      this.totalLength = to;
      this.contours.push({ from, to, contour });
    }
  }

  getTotalLength() {
    return this.totalLength;
  }

  getPointAtLength(length: number) {
    const contour = this.contours.find(
      ({ from, to }) => length >= from && length <= to
    );
    if (!contour) {
      const lastContour = this.contours[this.contours.length - 1];
      return lastContour.contour.getPosTan(lastContour.contour.length())[0];
      //throw new Error(`Invalid length ${length}`);
    }
    return contour.contour.getPosTan(length - contour.from)[0];
  }
}

export const inflate = (rct: SkRect, amount: number) =>
  rect(
    rct.x - amount,
    rct.y - amount,
    rct.width + 2 * amount,
    rct.height + 2 * amount
  );

export const inflateRounded = (rct: SkRRect, amount: number) =>
  rrect(inflate(rct.rect, amount), rct.rx, rct.ry);

export const deflate = (rct: SkRect, amount: number) =>
  rect(
    rct.x + amount,
    rct.y + amount,
    rct.width - 2 * amount,
    rct.height - 2 * amount
  );

export const fromCircle = (c: Vector, r: number) =>
  rect(c.x - r, c.y - r, 2 * r, 2 * r);

export const addPadding = (
  rct: SkRect,
  top: number,
  right: number,
  bottom: number,
  left: number
) =>
  rect(
    rct.x + left,
    rct.y + top,
    rct.width - left - right,
    rct.height - top - bottom
  );

export const splitCanvas = (ratio: number) => [
  rect(0, 0, CANVAS.width * ratio, CANVAS.height),
  rect(CANVAS.width * ratio, 0, CANVAS.width * (1 - ratio), CANVAS.height),
];

export const zoomTo = (dst: SkRect) => {
  const transform = fitbox("cover", dst, CANVAS);
  let matrix = translate(transform[0].translateX, transform[1].translateY);
  matrix = multiply4(matrix, scale(transform[2].scaleX, transform[3].scaleY));
  return matrix;
};
