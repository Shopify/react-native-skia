import { Skia } from "../Skia";
import type { DataSource } from "../types";

import { useRawData } from "./Data";

/**
 * Returns a Skia Image object
 * */
export const useImage = (source: DataSource) =>
  useRawData(source, Skia.MakeImageFromEncoded);
