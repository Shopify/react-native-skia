import { useEffect, useMemo } from "react";

import { Reanimated } from "./ReanimatedProxy";

export const useDerivedValueOnJS = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: () => any,
  deps: unknown[]
) => {
  const { useSharedValue, runOnJS, startMapper, stopMapper } = Reanimated;
  const init = useMemo(() => fn(), [fn]);
  const value = useSharedValue(init);
  useEffect(() => {
    const mapperId = startMapper(() => {
      "worklet";
      runOnJS(fn)();
    }, deps);
    return () => stopMapper(mapperId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deps, fn]);
  return value;
};
