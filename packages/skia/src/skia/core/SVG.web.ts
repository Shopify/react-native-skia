import { useEffect, useState } from "react";

import { Skia } from "../Skia";
import type { DataSourceParam, SkSVG } from "../types";

export const useSVG = (
  source: DataSourceParam,
  onError?: (err: Error) => void
) => {
  const [svg, setSVG] = useState<SkSVG | null>(null);
  if (source === null || source === undefined) {
    throw new Error(`Invalid svg data source. Got: ${source}`);
  }
  useEffect(() => {
    (async () => {
      let src: string;
      if (typeof source === "string") {
        src = source;
      } else if (
        typeof source === "object" &&
        "default" in source &&
        typeof source.default === "string"
      ) {
        src = source.default;
      } else if (typeof source === "object" && "uri" in source) {
        src = source.uri;
      } else {
        throw new Error(
          `Invalid svg data source. Make sure that the source resolves to a string. Got: ${JSON.stringify(
            source,
            null,
            2
          )}`
        );
      }
      const result = await fetch(src);
      const svgStr = await result.text();
      const newSvg = Skia.SVG.MakeFromString(svgStr);
      setSVG(newSvg);
      if (newSvg === null && onError !== undefined) {
        onError(new Error("Failed to create SVG from source."));
      }
    })();
  }, [onError, source]);
  return svg;
};
