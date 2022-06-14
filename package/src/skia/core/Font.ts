/*global SkiaApi*/
import { useMemo } from "react";

import { Skia } from "../Skia";
import type { DataSource, SkFont } from "../types";

import { useTypeface } from "./Typeface";

/**
 * Returns a Skia Font object
 * */
export const useFont = (
  font: DataSource | null | undefined,
  size?: number,
  onError?: (err: Error) => void
): SkFont | null => {
  const typeface = useTypeface(font, onError);
  return useMemo(() => {
    if (typeface === null) {
      return null;
    } else if (typeface && size) {
      return Skia.Font(typeface, size);
    } else if (typeface && !size) {
      return Skia.Font(typeface);
    } else {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeface]);
};
