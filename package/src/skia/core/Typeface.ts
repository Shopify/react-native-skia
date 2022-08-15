import { Skia } from "../Skia";
import type { DataSourceFromHook } from "../types";

import { useRawData } from "./Data";

const tfFactory = Skia.Typeface.MakeFreeTypeFaceFromData.bind(Skia.Typeface);

/**
 * Returns a Skia Typeface object
 * */
export const useTypeface = (
  source: DataSourceFromHook,
  onError?: (err: Error) => void
) => useRawData(source, tfFactory, onError);
