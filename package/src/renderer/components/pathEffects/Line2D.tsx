import React from "react";
import type { ReactNode } from "react";

import { isPathEffect } from "../../../skia/types";
import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import type { SkMatrix } from "../../../skia/types";

export interface Line2DPathEffectProps {
  children?: ReactNode | ReactNode[];
  width: number;
  matrix: SkMatrix;
}

const onDeclare = createDeclaration<Line2DPathEffectProps>(
  ({ width, matrix }, children, { Skia }) => {
    const [child] = children.filter(isPathEffect);
    const pe = Skia.PathEffect.MakeLine2D(width, matrix);
    if (child) {
      if (!pe) {
        return child;
      }
      return Skia.PathEffect.MakeCompose(pe, child);
    }
    return pe;
  }
);

export const Line2DPathEffect = (
  props: AnimatedProps<Line2DPathEffectProps>
) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
