import { Skia } from "../Skia";
import type { DataSourceFromHook } from "../types";

import { useRawData } from "./Data";

const svgFactory = Skia.SVG.MakeFromData.bind(Skia.SVG);

export const useSVG = (
  source: DataSourceFromHook,
  onError?: (err: Error) => void
) => useRawData(source, svgFactory, onError);
