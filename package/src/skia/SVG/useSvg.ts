import { Skia } from "../Skia";
import type { DataSource } from "../Data/Data";
import { useRawData } from "../Data/Data";

export const useSVG = (source: DataSource) =>
  useRawData(source, Skia.SVG.MakeFromData);
