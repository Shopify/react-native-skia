import type { IRect, IRRect } from "../../skia";
import { vec } from "../math/Vector";

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

export const isRectCtor = (def: RectOrRRectDef): def is RectCtor =>
  !def.hasOwnProperty("rect");
export const isRect = (def: RectOrRRectDef): def is IRect =>
  def.hasOwnProperty("rect");
export const isRRect = (def: RectOrRRectDef): def is IRRect =>
  !isRectCtor(def) && def.hasOwnProperty("rx");

export interface RectCtor {
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
  ry?: number;
}

export type RectDef = RectCtor | { rect: IRect };
export type RectOrRRectDef = RectCtor | { rect: IRect | IRRect };

export const processRect = (def: RectDef) => {
  if (isRectCtor(def)) {
    return rect(def.x, def.y, def.width, def.height);
  } else {
    return def.rect;
  }
};

export const processRectOrRRect = (def: RectOrRRectDef) => {
  if (
    isRectCtor(def) &&
    !def.hasOwnProperty("rx") &&
    !def.hasOwnProperty("ry")
  ) {
    return rect(def.x, def.y, def.width, def.height);
  } else if (isRectCtor(def)) {
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
