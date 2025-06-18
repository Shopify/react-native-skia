import { isPath } from "../../../skia/types";
export const processPath = (Skia, rawPath) => {
  "worklet";

  const path = typeof rawPath === "string" ? Skia.Path.MakeFromSVGString(rawPath) : rawPath;
  if (!path) {
    throw new Error("Invalid path: " + rawPath);
  }
  return path;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isPathDef = def => {
  "worklet";

  return typeof def === "string" || isPath(def);
};
//# sourceMappingURL=Path.js.map