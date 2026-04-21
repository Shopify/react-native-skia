import type { SkPath, SkRect, Vector } from "@shopify/react-native-skia";
import {
  processTransform2d,
  fitbox,
  center,
  Skia,
} from "@shopify/react-native-skia";

import { CANVAS } from "./Theme";

export const repeat = <T,>(input: T[], i: number, result: T[] = []): T[] => {
  if (i <= 0) {
    return result;
  }
  return repeat(input, i - 1, result.concat(input));
};

export const rectFromCircle = (c: Vector, r: number) =>
  Skia.XYWHRect(c.x - r, c.y - r, r * 2, r * 2);

export const rect = (x: number, y: number, width: number, height: number) => {
  return Skia.Path.Rect(Skia.XYWHRect(x, y, width, height));
};

export const rrect = (
  x: number,
  y: number,
  width: number,
  height: number,
  r: number
) => {
  return Skia.Path.RRect(
    Skia.RRectXY(Skia.XYWHRect(x, y, width, height), r, r)
  );
};

export const circle = (c: Vector, r: number) => {
  return Skia.Path.Circle(c.x, c.y, r);
};

export const translate = (path: SkPath, a: Vector) => {
  const m3 = Skia.Matrix();
  m3.translate(a.x, a.y);
  return path.transform(m3);
};

export const flipH = (path: SkPath) => {
  const bounds = path.computeTightBounds();
  const origin = center(bounds);
  const m3 = Skia.Matrix();
  m3.translate(origin.x, origin.y);
  m3.scale(-1, 1);
  m3.translate(-origin.x, -origin.y);
  return path.transform(m3);
};

export const line = (a: Vector, b: Vector) => {
  return Skia.Path.Line(a, b);
};

export const vLine = (x: number) => {
  return Skia.PathBuilder.Make().moveTo(x, 0).lineTo(x, CANVAS.height).build();
};

export const hLine = (y: number) => {
  return Skia.PathBuilder.Make().moveTo(0, y).lineTo(CANVAS.width, y).build();
};

export const fitPath = (path: SkPath, dst: SkRect) => {
  return path.transform(
    processTransform2d(fitbox("contain", path.computeTightBounds(), dst))
  );
};
