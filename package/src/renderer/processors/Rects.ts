// Here we use any because hasOwnProperty doesn't work on JSI instances not does the (key in obj) syntax
// And using Object.keys for such use-case is incredibly slow
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SkRect, SkRRect } from "../../skia";

import { vec } from "./math/Vector";

export const point = (x: number, y: number) => ({ x, y });

export const rect = (x: number, y: number, width: number, height: number) => ({
  x,
  y,
  width,
  height,
});

export const rrect = (r: SkRect, rx: number, ry: number) => ({
  rect: r,
  rx,
  ry,
});

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

const isRRectCtor = (def: RRectDef): def is RRectCtor =>
  (def as any).rect === undefined;
const isRectCtor = (def: RectDef): def is RectCtor =>
  (def as any).rect === undefined;
export const isRRect = (def: SkRect | SkRRect): def is SkRRect =>
  (def as any).rect !== undefined;

export interface RectCtor {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RRectCtor extends RectCtor {
  rx: number;
  ry?: number;
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
    const { rx, ry } = def;
    return rrect(rect(def.x, def.y, def.width, def.height), rx, ry ?? rx);
  } else {
    return def.rect;
  }
};
