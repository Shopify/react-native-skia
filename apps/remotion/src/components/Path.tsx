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
  const path = Skia.Path.Make();
  path.addRect(Skia.XYWHRect(x, y, width, height));
  return path;
};

export const rrect = (
  x: number,
  y: number,
  width: number,
  height: number,
  r: number
) => {
  const path = Skia.Path.Make();
  path.addRRect(Skia.RRectXY(Skia.XYWHRect(x, y, width, height), r, r));
  return path;
};

export const circle = (c: Vector, r: number) => {
  const path = Skia.Path.Make();
  path.addCircle(c.x, c.y, r);
  return path;
};

export const translate = (path: SkPath, a: Vector) => {
  const m3 = Skia.Matrix();
  m3.translate(a.x, a.y);
  path.transform(m3);
  return path;
};

export const flipH = (path: SkPath) => {
  const bounds = path.computeTightBounds();
  const origin = center(bounds);
  const m3 = Skia.Matrix();
  m3.translate(origin.x, origin.y);
  m3.scale(-1, 1);
  m3.translate(-origin.x, -origin.y);
  path.transform(m3);
  return path;
};

export const line = (a: Vector, b: Vector) => {
  const path = Skia.Path.Make();
  path.moveTo(a.x, a.y);
  path.lineTo(b.x, b.y);
  return path;
};

export const vLine = (x: number) => {
  const path = Skia.Path.Make();
  path.moveTo(x, 0);
  path.lineTo(x, CANVAS.height);
  return path;
};

export const hLine = (y: number) => {
  const path = Skia.Path.Make();
  path.moveTo(0, y);
  path.lineTo(CANVAS.width, y);
  return path;
};

export const fitPath = (path: SkPath, dst: SkRect) => {
  path.transform(
    processTransform2d(fitbox("contain", path.computeTightBounds(), dst))
  );
};
