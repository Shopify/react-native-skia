import React from "react";

import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import type { Color } from "../../../skia/types";
import { processColor } from "../../processors/Color";

import { getInput } from "./getInput";
import { MakeInnerShadow } from "./InnerShadow";

export interface ShadowProps {
  dx: number;
  dy: number;
  blur: number;
  color: Color;
  inner?: boolean;
  shadowOnly?: boolean;
}

const onDeclare = createDeclaration<ShadowProps>(
  (
    { dx, dy, blur, color: cl, shadowOnly, inner },
    children,
    { opacity, Skia }
  ) => {
    const input = getInput(Skia, children);
    const color = processColor(Skia, cl, opacity);
    if (inner) {
      return MakeInnerShadow(
        Skia,
        shadowOnly,
        dx,
        dy,
        blur,
        blur,
        color,
        input
      );
    } else if (shadowOnly) {
      return Skia.ImageFilter.MakeDropShadowOnly(
        dx,
        dy,
        blur,
        blur,
        color,
        input
      );
    } else {
      return Skia.ImageFilter.MakeDropShadow(dx, dy, blur, blur, color, input);
    }
  }
);

export const Shadow = (props: AnimatedProps<ShadowProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
