/*global SkiaApi*/
import type { DependencyList } from "react";
import { useMemo } from "react";

import type { ITypeface } from "../skia/Typeface";
import type { IFont } from "../skia/Font";

/**
 * Returns a Skia Font object
 * */
export const useFont = (
  typeface?: ITypeface,
  size?: number,
  deps: DependencyList = []
): IFont =>
  useMemo(() => {
    if (typeface && size) {
      return SkiaApi.Font(typeface, size);
    } else if (typeface && !size) {
      return SkiaApi.Font(typeface);
    } else {
      return SkiaApi.Font();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
