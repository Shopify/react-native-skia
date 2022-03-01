/* eslint-disable @typescript-eslint/no-explicit-any */
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
  (def as any).cx;
export const processCircle = (def: CircleDef) => {
  if (isCircleScalarDef(def)) {
    return { c: vec(def.cx, def.cy), r: def.r };
  }
  return def;
};
