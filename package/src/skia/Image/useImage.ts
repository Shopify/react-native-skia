import { useCallback } from "react";

import type { DataSource, Data } from "../Data/Data";
import { useRawData } from "../Data/Data";
import { Skia } from "../Skia";

/**
 * Returns a Skia Image object
 * */
export const useImage = (
  source: DataSource,
  onError?: (err: Error) => void
) => {
  const factory = useCallback(
    (data: Data) => {
      try {
        return Skia.MakeImageFromEncoded(data);
      } catch (err) {
        if (onError) {
          onError(err as Error);
        }
        return null;
      }
    },
    [onError]
  );
  return useRawData(source, factory);
};
