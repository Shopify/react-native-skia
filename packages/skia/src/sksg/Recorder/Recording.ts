import type { Skia, SkPaint } from "../../skia/types";

import type { Command } from "./Core";

export interface Recording {
  commands: Command[];
  paintPool: SkPaint[];
}

export const createRecording = (
  Skia: Skia,
  commands: Command[]
): Recording => ({
  commands,
  paintPool: [Skia.Paint()],
});
