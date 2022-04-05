import type { SkPath } from "../../skia";
import { Skia, isPath } from "../../skia";

export type PathDef = string | SkPath;

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isPathDef = (def: any): def is PathDef =>
  typeof def === "string" || isPath(def);
