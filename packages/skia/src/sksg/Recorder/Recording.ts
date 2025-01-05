import type { SkPaint } from "../../skia/types";

import type { Command } from "./Core";

export interface Recording {
  commands: Command[];
  paintPool: SkPaint[];
}

export const createRecording = (commands: Command[]): Recording => ({
  commands,
  paintPool: [],
});
