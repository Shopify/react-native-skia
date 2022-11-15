import { Skia } from "../Skia";
import type { SkRect, SkRRect } from "../types";
import { isRRect } from "../types";

import { vec } from "./Vector";

export const rect = (x: number, y: number, width: number, height: number) =>
  Skia.XYWHRect(x, y, width, height);

export const bounds = (rects: SkRect[]) => {
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  const width = Math.max(...rects.map((r) => r.x + r.width));
  const height = Math.max(...rects.map((r) => r.y + r.height));
  return rect(x, y, width - x, height - y);
};

export const topLeft = (r: SkRect | SkRRect) =>
  isRRect(r) ? vec(r.rect.x, r.rect.y) : vec(r.x, r.y);
export const topRight = (r: SkRect | SkRRect) =>
  isRRect(r) ? vec(r.rect.x + r.rect.width, r.rect.y) : vec(r.x + r.width, r.y);
export const bottomLeft = (r: SkRect | SkRRect) =>
  isRRect(r)
    ? vec(r.rect.x, r.rect.y + r.rect.height)
    : vec(r.x, r.y + r.height);
export const bottomRight = (r: SkRect | SkRRect) =>
  isRRect(r)
    ? vec(r.rect.x + r.rect.width, r.rect.y + r.rect.height)
    : vec(r.x + r.width, r.y + r.height);
export const center = (r: SkRect | SkRRect) =>
  isRRect(r)
    ? vec(r.rect.x + r.rect.width / 2, r.rect.y + r.rect.height / 2)
    : vec(r.x + r.width / 2, r.y + r.height / 2);
