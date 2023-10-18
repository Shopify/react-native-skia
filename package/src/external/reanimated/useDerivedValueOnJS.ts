import { useEffect, type DependencyList } from "react";

import {
  useSharedValue,
  runOnJS,
  startMapper,
  stopMapper,
} from "./moduleWrapper";

export const useDerivedValueOnJS = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: () => any,
  deps?: DependencyList
) => {
  const value = useSharedValue(fn());
  useEffect(() => {
    const mapperId = startMapper(() => {
      "worklet";
      runOnJS(fn)();
    }, deps);
    return () => stopMapper(mapperId);
  }, [deps, fn]);
  return value;
};
