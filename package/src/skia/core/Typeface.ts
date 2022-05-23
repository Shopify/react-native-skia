import { Skia } from "../Skia";
import type { DataSource } from "../types";

import { useRawData } from "./Data";
/**
 * Returns a Skia Typeface object
 * */
export const useTypeface = (source: DataSource) =>
  useRawData(source, Skia.Typeface.MakeFreeTypeFaceFromData);
