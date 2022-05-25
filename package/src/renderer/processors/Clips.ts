import type { SkCanvas, ClipOp, SkRect, SkRRect } from "../../skia";

import type { PathDef } from "./Paths";
import { processPath, isPathDef } from "./Paths";
import { isRRect } from "./Rects";

export type ClipDef = SkRRect | SkRect | PathDef;

export const processClip = (canvas: SkCanvas, def: ClipDef, op: ClipOp) => {
  if (isPathDef(def)) {
    const path = processPath(def);
    canvas.clipPath(path, op, true);
  } else if (isRRect(def)) {
    canvas.clipRRect(def, op, true);
  } else {
    canvas.clipRect(def, op, true);
  }
};
