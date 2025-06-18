import { Skia } from "../Skia";
export const useSVG = (source, onError) => {
  if (source === null || source === undefined) {
    throw new Error(`Invalid svg data source. Got: ${source}`);
  }
  if (typeof source !== "object" || source instanceof Uint8Array || typeof source.default !== "string") {
    throw new Error(`Invalid svg data source. Make sure that the source resolves to a string. Got: ${JSON.stringify(source, null, 2)}`);
  }
  const svg = Skia.SVG.MakeFromString(source.default);
  if (svg === null && onError !== undefined) {
    onError(new Error("Failed to create SVG from source."));
  }
  return svg;
};
//# sourceMappingURL=SVG.web.js.map