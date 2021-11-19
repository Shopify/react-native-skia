import { useMemo, useState } from "react";

import { Skia } from "../Skia";

import type { ISvgDom } from "./SVG";

/**
 * Returns a Skia SvgDom object loaded from file using require
 * */
export const useSvg = (source: number) => {
  const [svgDom, setSvgDom] = useState<ISvgDom>();
  useMemo(
    () =>
      Skia.Svg.fromUri(source).then((value) => {
        setSvgDom(value);
      }),
    [source]
  );
  return svgDom;
};
