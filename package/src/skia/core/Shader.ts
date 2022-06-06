import { useMemo } from "react";

import { Skia } from "../Skia";

export const useShader = (sksl: string) =>
  useMemo(() => {
    console.warn("Use shader will be deprecated.");
    return Skia.RuntimeEffect.Make(sksl);
  }, [sksl]);
