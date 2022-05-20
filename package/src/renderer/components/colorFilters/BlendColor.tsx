import React from "react";
import type { ReactNode } from "react";

import type { Color } from "../../../skia";
import { BlendMode, Skia } from "../../../skia";
import { createDeclaration } from "../../nodes";
import type { SkEnum, AnimatedProps } from "../../processors";
import { enumKey } from "../../processors";

import { composeColorFilter } from "./Compose";

export interface BlendColorProps {
  mode: SkEnum<typeof BlendMode>;
  color: Color;
  children?: ReactNode | ReactNode[];
}

const onDeclare = createDeclaration<BlendColorProps>(
  ({ mode, color }, children) => {
    const cf = Skia.ColorFilter.MakeBlend(
      Skia.Color(color),
      BlendMode[enumKey(mode)]
    );
    return composeColorFilter(cf, children);
  }
);

export const BlendColor = (props: AnimatedProps<BlendColorProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
