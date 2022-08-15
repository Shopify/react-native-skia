import { Skia } from "../Skia";
import type { DataSourceFromHook } from "../types";

import { useRawData } from "./Data";

const imgFactory = Skia.Image.MakeImageFromEncoded.bind(Skia.Image);

/**
 * Returns a Skia Image object
 * */
export const useImage = (
  source: DataSourceFromHook,
  onError?: (err: Error) => void
) => useRawData(source, imgFactory, onError);
