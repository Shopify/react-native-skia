import { Skia } from "../Skia";
import type { DataSourceParam } from "../types";

import { useRawData } from "./Data";

const animatedImgFactory = Skia.AnimatedImage.MakeAnimatedImageFromEncoded.bind(
  Skia.AnimatedImage
);

/**
 * Returns a Skia Animated Image object
 * */
export const useAnimatedImage = (
  source: DataSourceParam,
  onError?: (err: Error) => void,
  managed = true
) => useRawData(source, animatedImgFactory, onError, managed);
