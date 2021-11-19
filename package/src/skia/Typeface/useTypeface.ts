import type { DependencyList } from "react";
import { useMemo } from "react";

import { Skia } from "../Skia";

import type { Typeface, FontStyle } from "./Typeface";

/**
 * Returns a Skia Typeface object
 * */
export const useTypeface = (
  name?: string,
  fontStyle?: FontStyle,
  deps: DependencyList = []
): Typeface =>
  useMemo(() => {
    return name && fontStyle ? Skia.Typeface(name, fontStyle) : Skia.Typeface();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
