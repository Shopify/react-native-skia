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

export const isPathDef = (shape: unknown): shape is { path: PathDef } =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (shape as any).path !== undefined;
