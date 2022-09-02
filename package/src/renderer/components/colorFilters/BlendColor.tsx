import React from "react";
import type { ReactNode } from "react";

import type { Color } from "../../../skia/types";
import { BlendMode } from "../../../skia/types";
import { createDeclaration } from "../../nodes";
import type { AnimatedProps } from "../../processors";
import type { SkEnum } from "../../../dom/types";
import { enumKey } from "../../../dom/nodes/datatypes";

import { composeColorFilter } from "./Compose";

export interface BlendColorProps {
  mode: SkEnum<typeof BlendMode>;
  color: Color;
  children?: ReactNode | ReactNode[];
}

const onDeclare = createDeclaration<BlendColorProps>(
  ({ mode, color }, children, { Skia }) => {
    const cf = Skia.ColorFilter.MakeBlend(
      Skia.Color(color),
      BlendMode[enumKey(mode)]
    );
    return composeColorFilter(Skia, cf, children);
  }
);

export const BlendColor = (props: AnimatedProps<BlendColorProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
