import { useMemo } from "react";

import { RuntimeEffectType } from "../skia/types";
import { Api } from "../skia/Api";

export const useShader = (sksl: string) =>
  useMemo(() => Api.RuntimeEffects(sksl, RuntimeEffectType.Shader), [sksl]);
