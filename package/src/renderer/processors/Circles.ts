import type { Vector } from "./math/Vector";
import { vec } from "./math/Vector";

interface PointCircleDef {
  c: Vector;
  r: number;
}

interface ScalarCircleDef {
  cx: number;
  cy: number;
  r: number;
}

export type CircleDef = PointCircleDef | ScalarCircleDef;

const isCircleScalarDef = (def: CircleDef): def is ScalarCircleDef =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (def as any).cx;
export const processCircle = (def: CircleDef) => {
  if (isCircleScalarDef(def)) {
    return { c: vec(def.cx, def.cy), r: def.r };
  }
  return def;
};
