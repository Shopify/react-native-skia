import type { DataSource } from "../Data/Data";
import { useRawData } from "../Data/Data";
import { Skia } from "../Skia";

/**
 * Returns a Skia Image object
 * */
export const useImage = (source: DataSource) =>
  useRawData(source, Skia.MakeImageFromEncoded);
