import React from "react";
import type { ReactNode } from "react";

import { BlendMode, Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { SkEnum, ColorProp, AnimatedProps } from "../../processors";
import { enumKey } from "../../processors";

import { composeColorFilter } from "./Compose";

export interface BlendProps {
  mode: SkEnum<typeof BlendMode>;
  color: ColorProp;
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
