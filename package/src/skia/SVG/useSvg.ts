import { useData } from "../Data/Data";
import { Skia } from "../Skia";

export const useSVG = (source: ReturnType<typeof require>) =>
  useData(source, Skia.SVG.MakeFromData);
