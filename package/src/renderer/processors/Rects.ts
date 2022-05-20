/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SkRect, SkRRect } from "../../skia";
import { Skia } from "../../skia";

import { vec } from "./math/Vector";
import type { Radius } from "./Radius";
import { processRadius } from "./Radius";

export const point = (x: number, y: number) => Skia.Point(x, y);

export const rect = (x: number, y: number, width: number, height: number) =>
  Skia.XYWHRect(x, y, width, height);

export const rrect = (r: SkRect, rx: number, ry: number) =>
  Skia.RRectXY(r, rx, ry);

export const bounds = (rects: SkRect[]) => {
  const x = Math.min(...rects.map((r) => r.x));
  const y = Math.min(...rects.map((r) => r.y));
  const width = Math.max(...rects.map((r) => r.x + r.width));
  const height = Math.max(...rects.map((r) => r.y + r.height));
  return rect(x, y, width, height);
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

// We have an issue to check property existence on JSI backed instances
const isRRectCtor = (def: RRectDef): def is RRectCtor =>
  (def as any).rect === undefined;
// We have an issue to check property existence on JSI backed instances
const isRectCtor = (def: RectDef): def is RectCtor =>
  (def as any).rect === undefined;
// We have an issue to check property existence on JSI backed instances
export const isRRect = (def: SkRect | SkRRect): def is SkRRect =>
  (def as any).rect !== undefined;

export interface RectCtor {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RRectCtor extends RectCtor {
  r: Radius;
}

export type RectDef = RectCtor | { rect: SkRect };
export type RRectDef = RRectCtor | { rect: SkRRect };

export const processRect = (def: RectDef) => {
  if (isRectCtor(def)) {
    return rect(def.x, def.y, def.width, def.height);
  } else {
    return def.rect;
  }
};

export const processRRect = (def: RRectDef) => {
  if (isRRectCtor(def)) {
    const r = processRadius(def.r);
    return rrect(rect(def.x, def.y, def.width, def.height), r.x, r.y);
  } else {
    return def.rect;
  }
};
