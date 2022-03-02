import React from "react";
import type { ReactNode } from "react";

import { BlendMode, Skia } from "../../../skia";
import { useDeclaration } from "../../nodes";
import type { SkEnum, AnimatedProps } from "../../processors";
import { enumKey } from "../../processors";
import type { Color } from "../../../skia";

import { composeColorFilter } from "./Compose";

export interface BlendProps {
  mode: SkEnum<typeof BlendMode>;
  color: Color;
  children?: ReactNode | ReactNode[];
}

export const Blend = (props: AnimatedProps<BlendProps>) => {
  const declaration = useDeclaration(props, ({ mode, color }, children) => {
    const cf = Skia.ColorFilter.MakeBlend(
      Skia.Color(color),
      BlendMode[enumKey(mode)]
    );
    return composeColorFilter(cf, children);
  });
  return <skDeclaration declaration={declaration} {...props} />;
};
