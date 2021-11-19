import { useMemo } from "react";

import { Skia } from "../Skia";

export const useShader = (sksl: string) =>
  useMemo(() => Skia.RuntimeEffect.Make(sksl), [sksl]);
