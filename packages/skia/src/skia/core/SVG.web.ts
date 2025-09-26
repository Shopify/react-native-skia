import { Skia } from "../Skia";
import type { DataSourceParam } from "../types";

export const useSVG = (
  source: DataSourceParam,
  onError?: (err: Error) => void
) => {
  if (source === null || source === undefined) {
    throw new Error(`Invalid svg data source. Got: ${source}`);
  }
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
  const svg = Skia.SVG.MakeFromString(src);
  if (svg === null && onError !== undefined) {
    onError(new Error("Failed to create SVG from source."));
  }
  return svg;
};
