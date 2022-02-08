// Here we use any because hasOwnProperty doesn't work on JSI instances not does the (key in obj) syntax
// And using Object.keys for such use-case is incredibly slow
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";

import type { IRect, IRRect } from "../../skia";

import type { Vector as Point } from "./math/Vector";
import { vec } from "./math/Vector";

export interface ChildrenProps {
  children?: ReactNode | ReactNode[];
}

export { Point };

export const point = (x: number, y: number) => ({ x, y });
export const rect = (x: number, y: number, width: number, height: number) => ({
  x,
  y,
  width,
  height,
});
export const rrect = (r: IRect, rx: number, ry: number) => ({
  rect: r,
  rx,
  ry,
});

export const topLeft = (r: IRect | IRRect) =>
  isRRect(r) ? vec(r.rect.x, r.rect.y) : vec(r.x, r.y);
export const topRight = (r: IRect | IRRect) =>
  isRRect(r) ? vec(r.rect.x + r.rect.width, r.rect.y) : vec(r.x + r.width, r.y);
export const bottomLeft = (r: IRect | IRRect) =>
  isRRect(r)
    ? vec(r.rect.x, r.rect.y + r.rect.height)
    : vec(r.x, r.y + r.height);
export const bottomRight = (r: IRect | IRRect) =>
  isRRect(r)
    ? vec(r.rect.x + r.rect.width, r.rect.y + r.rect.height)
    : vec(r.x + r.width, r.y + r.height);
export const center = (r: IRect | IRRect) =>
  isRRect(r)
    ? vec(r.rect.x + r.rect.width / 2, r.rect.y + r.rect.height / 2)
    : vec(r.x + r.width / 2, r.y + r.height / 2);

export const isRRectCtor = (def: RRectDef): def is RRectCtor =>
  (def as any).rect === undefined;
export const isRectCtor = (def: RectDef): def is RectCtor =>
  (def as any).rect === undefined;
export const isRRect = (def: IRect | IRRect): def is IRRect =>
  (def as any).rect !== undefined;

export interface RectCtor {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RRectCtor extends RectCtor {
  rx?: number;
  ry?: number;
}

export type RectDef = RectCtor | { rect: IRect };
export type RRectDef = RRectCtor | { rect: IRRect };

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
    return rrect(
      rect(def.x, def.y, def.width, def.height),
      (rx ?? ry) as number,
      (ry ?? rx) as number
    );
  } else {
    return def.rect;
  }
};
