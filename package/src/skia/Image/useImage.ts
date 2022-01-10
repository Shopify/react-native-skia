import { useData } from "../Data/Data";
import { Skia } from "../Skia";

/**
 * Returns a Skia Image object
 * */
export const useImage = (source: ReturnType<typeof require>) =>
  useData(source, Skia.MakeImageFromEncoded);
