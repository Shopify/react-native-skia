/*global SkiaApi*/
import type { DependencyList } from "react";
import { useMemo } from "react";

import { Skia } from "../Skia";
import type { Typeface } from "../Typeface";

import type { Font } from "./Font";

/**
 * Returns a Skia Font object
 * */
export const useFont = (
  typeface?: Typeface,
  size?: number,
  deps: DependencyList = []
): Font =>
  useMemo(() => {
    if (typeface && size) {
      return Skia.Font(typeface, size);
    } else if (typeface && !size) {
      return Skia.Font(typeface);
    } else {
      return Skia.Font();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
