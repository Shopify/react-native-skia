/*global SkiaApi*/
import { useMemo } from "react";

import type { DataSource } from "../Data";
import { Skia } from "../Skia";
import { useTypeface } from "../Typeface";

import type { IFont } from "./Font";

/**
 * Returns a Skia Font object
 * */
export const useFont = (font: DataSource, size?: number): IFont | null => {
  const typeface = useTypeface(font);
  return useMemo(() => {
    if (typeface === null) {
      return null;
    } else if (typeface && size) {
      return Skia.Font(typeface, size);
    } else if (typeface && !size) {
      return Skia.Font(typeface);
    } else {
      return Skia.Font();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeface]);
};
