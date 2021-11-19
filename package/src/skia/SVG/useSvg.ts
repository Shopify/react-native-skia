import { useMemo, useState } from "react";

import type { ISvgDom } from "./SVG";
import { SvgObject } from "./SVG";

/**
 * Returns a Skia SvgDom object loaded from file using require
 * */
export const useSvg = (source: number) => {
  const [svgDom, setSvgDom] = useState<ISvgDom>();
  useMemo(
    () =>
      SvgObject.fromUri(source).then((value) => {
        setSvgDom(value);
      }),
    [source]
  );
  return svgDom;
};
