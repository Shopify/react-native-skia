import type { DependencyList } from "react";
import { useMemo } from "react";

import type { ITypeface, FontStyle } from "../skia/Typeface";
import { Api } from "../skia/Api";

/**
 * Returns a Skia Typeface object
 * */
export const useTypeface = (
  name?: string,
  fontStyle?: FontStyle,
  deps: DependencyList = []
): ITypeface =>
  useMemo(() => {
    return name && fontStyle ? Api.Typeface(name, fontStyle) : Api.Typeface();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
