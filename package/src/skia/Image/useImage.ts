import { useData } from "../Data/Data";
import { Skia } from "../Skia";

import type { IImage } from "./Image";

export const isImage = (image: unknown): image is IImage =>
  typeof image === "object";

/**
 * Returns a Skia Typeface object
 * */
export const useImage = (source: ReturnType<typeof require>) =>
  useData(source, Skia.MakeImageFromEncoded);
