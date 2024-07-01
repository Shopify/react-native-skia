import type { Skia } from "../../../skia/types";
import { isPath } from "../../../skia/types";
import type { PathDef } from "../../types";

export const processPath = (Skia: Skia, rawPath: PathDef) => {
  "worklet";
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
export const isPathDef = (def: any): def is PathDef => {
  "worklet";
  return typeof def === "string" || isPath(def);
};
