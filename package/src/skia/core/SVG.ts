import { Skia } from "../Skia";
import type { DataSource } from "../types";

import { useRNData } from "./Data";

export const useSVG = (
  source: DataSource | null | undefined,
  onError?: (err: Error) => void
) => useRNData(source, Skia.SVG.MakeFromData, onError);
