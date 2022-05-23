import { Skia } from "../Skia";
import type { DataSource } from "../types";

import { useRawData } from "./Data";

export const useSVG = (source: DataSource) =>
  useRawData(source, Skia.SVG.MakeFromData);
