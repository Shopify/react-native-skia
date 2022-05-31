/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Skia, SkRect, SkRRect, Vector } from "../../skia/types";

import type { Radius } from "./Radius";
import { processRadius } from "./Radius";

export const isEdge = (pos: Vector, b: SkRect) =>
  pos.x === b.x || pos.y === b.y || pos.x === b.width || pos.y === b.height;

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

export const processRect = (Skia: Skia, def: RectDef) => {
  if (isRectCtor(def)) {
    return Skia.XYWHRect(def.x, def.y, def.width, def.height);
  } else {
    return def.rect;
  }
};

export const processRRect = (Skia: Skia, def: RRectDef) => {
  if (isRRectCtor(def)) {
    const r = processRadius(Skia, def.r);
    return Skia.RRectXY(
      Skia.XYWHRect(def.x, def.y, def.width, def.height),
      r.x,
      r.y
    );
  } else {
    return def.rect;
  }
};
