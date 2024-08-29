import { useEffect, useMemo } from "react";

import Rea from "./ReanimatedProxy";

export const useDerivedValueOnJS = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: () => any,
  deps: unknown[]
) => {
  const init = useMemo(() => fn(), [fn]);
  const value = Rea.useSharedValue(init);
  useEffect(() => {
    const mapperId = Rea.startMapper(() => {
      "worklet";
      Rea.runOnJS(fn)();
    }, deps);
    return () => Rea.stopMapper(mapperId);
  }, [deps, fn]);
  return value;
};
