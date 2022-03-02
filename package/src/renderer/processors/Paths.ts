import type { IPath } from "../../skia/Path/Path";
import { Skia } from "../../skia/Skia";

export type PathDef = string | IPath;

export const processPath = (rawPath: PathDef) => {
  const path =
    typeof rawPath === "string"
      ? Skia.Path.MakeFromSVGString(rawPath)
      : rawPath;
  if (!path) {
    throw new Error("Invalid path: " + rawPath);
  }
  return path;
};
