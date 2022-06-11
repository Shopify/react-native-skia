import { Skia } from "../Skia";
import type { DataSource } from "../types";

import { useRNData } from "./Data";

/**
 * Returns a Skia Image object
 * */
export const useImage = (
  source: DataSource | null | undefined,
  onError?: (err: Error) => void
) => useRNData(source, Skia.Image.MakeImageFromEncoded, onError);
