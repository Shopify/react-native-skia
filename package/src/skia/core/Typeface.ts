import { Skia } from "../Skia";
import type { DataSource } from "../types";

import { useRNData } from "./Data";
/**
 * Returns a Skia Typeface object
 * */
export const useTypeface = (
  source: DataSource | null | undefined,
  onError?: (err: Error) => void
) => useRNData(source, Skia.Typeface.MakeFreeTypeFaceFromData, onError);
