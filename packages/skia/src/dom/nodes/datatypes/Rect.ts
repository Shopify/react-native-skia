"worklet";

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Skia, SkRect, SkRRect, Vector } from "../../../skia/types";
import type { RectCtor, RectDef, RRectCtor, RRectDef } from "../../types";

import { processRadius } from "./Radius";

export const isEdge = (pos: Vector, b: SkRect) => {
  return (
    pos.x === b.x || pos.y === b.y || pos.x === b.width || pos.y === b.height
  );
};

// We have an issue to check property existence on JSI backed instances
const isRRectCtor = (def: RRectDef): def is RRectCtor => {
  return (def as any).rect === undefined;
};
// We have an issue to check property existence on JSI backed instances
const isRectCtor = (def: RectDef): def is RectCtor => {
  return (def as any).rect === undefined;
};

export const processRect = (Skia: Skia, def: RectDef) => {
  if (isRectCtor(def)) {
    return Skia.XYWHRect(def.x ?? 0, def.y ?? 0, def.width, def.height);
  } else {
    return def.rect;
  }
};

export const processRRect = (Skia: Skia, def: RRectDef) => {
  if (isRRectCtor(def)) {
    const r = processRadius(Skia, def.r ?? 0);
    return Skia.RRectXY(
      Skia.XYWHRect(def.x ?? 0, def.y ?? 0, def.width, def.height),
      r.x,
      r.y
    );
  } else {
    return def.rect;
  }
};

export const inflate = (
  Skia: Skia,
  box: SkRRect,
  dx: number,
  dy: number,
  tx = 0,
  ty = 0
) => {
  return Skia.RRectXY(
    Skia.XYWHRect(
      box.rect.x - dx + tx,
      box.rect.y - dy + ty,
      box.rect.width + 2 * dx,
      box.rect.height + 2 * dy
    ),
    box.rx + dx,
    box.ry + dy
  );
};

export const deflate = (
  Skia: Skia,
  box: SkRRect,
  dx: number,
  dy: number,
  tx = 0,
  ty = 0
) => {
  return inflate(Skia, box, -dx, -dy, tx, ty);
};
