import { useMemo, useState } from "react";

import { Api } from "../skia/Api";
import type { ISvgDom } from "../skia/Svg";

/**
 * Returns a Skia SvgDom object loaded from file using require
 * */
export const useSvg = (source: number) => {
  const [svgDom, setSvgDom] = useState<ISvgDom>();
  useMemo(
    () =>
      Api.Svg.fromUri(source).then((value) => {
        setSvgDom(value);
      }),
    [source]
  );
  return svgDom;
};
