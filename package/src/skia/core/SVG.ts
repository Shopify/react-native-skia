import { Skia } from "../Skia";
import type { DataSource } from "../types";

import { useRawData } from "./Data";

export const useSVG = (source: DataSource, onError?: (err: Error) => void) =>
  useRawData(source, Skia.SVG.MakeFromData, onError);
