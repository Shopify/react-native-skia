import type { Skia, SkPaint } from "../skia/types";

import type { Command } from "./recorder/Recorder";

export interface StaticContext {
  paints: SkPaint[];
  commands: Command[];
}

export const createStaticContext = (Skia: Skia): StaticContext => {
  return { paints: [Skia.Paint()], commands: [] };
};
