"worklet";

import type { CircleDef, ScalarCircleDef } from "../../types";

export const isCircleScalarDef = (def: CircleDef): def is ScalarCircleDef =>
  // We have an issue to check property existence on JSI backed instances
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (def as any).cx !== undefined;

export const processCircle = (def: CircleDef) => {
  if (isCircleScalarDef(def)) {
    return { c: { x: def.cx, y: def.cy }, r: def.r };
  }
  return { ...def, c: def.c ?? { x: 0, y: 0 } };
};
