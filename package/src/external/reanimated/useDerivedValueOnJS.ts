import { useEffect, useMemo } from "react";

import {
  useSharedValue,
  runOnJS,
  startMapper,
  stopMapper,
} from "./moduleWrapper";

export const useDerivedValueOnJS = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: () => any,
  deps: unknown[]
) => {
  const init = useMemo(() => fn(), [fn]);
  const value = useSharedValue(init);
  useEffect(() => {
    const mapperId = startMapper(() => {
      "worklet";
      runOnJS(fn)();
    }, deps);
    return () => stopMapper(mapperId);
  }, [deps, fn]);
  return value;
};
