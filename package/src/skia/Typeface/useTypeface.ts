import { Skia } from "../Skia";
import { useData } from "../Data/Data";

/**
 * Returns a Skia Typeface object
 * */
export const useTypeface = (source: ReturnType<typeof require>) =>
  useData(source, Skia.Typeface.MakeFreeTypeFaceFromData);
