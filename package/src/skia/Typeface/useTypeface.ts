import { Skia } from "../Skia";
import type { DataSource } from "../Data/Data";
import { useRawData } from "../Data/Data";

/**
 * Returns a Skia Typeface object
 * */
export const useTypeface = (source: DataSource) =>
  useRawData(source, Skia.Typeface.MakeFreeTypeFaceFromData);
