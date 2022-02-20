import { Skia } from "./Skia";
import type { DataSource } from "./Data";
import { useRawData } from "./Data";
import type { SkJSIInstance } from "./JsiInstance";

export type IPicture = SkJSIInstance<"Picture">;

export const usePicture = (source: DataSource) =>
  useRawData(source, Skia.MakePicture);
