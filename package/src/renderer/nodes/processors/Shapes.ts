import type { IRect, IRRect } from "../../../skia";

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

export const isRectCtor = (def: RectDef): def is RectCtor =>
  !def.hasOwnProperty("rect");
export const isRect = (def: RectDef): def is IRect =>
  def.hasOwnProperty("rect");
export const isRRect = (def: RectDef): def is IRRect =>
  !isRectCtor(def) && def.hasOwnProperty("rx");

export interface RectCtor {
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
  ry?: number;
}
export type RectDef = RectCtor | { rect: IRect | IRRect };

export const processRect = (def: RectDef) => {
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
