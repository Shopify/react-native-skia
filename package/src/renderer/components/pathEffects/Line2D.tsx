import React from "react";
import type { ReactNode } from "react";

import { Skia } from "../../../skia";
import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { isPathEffect } from "../../../skia/PathEffect";
import type { SkMatrix } from "../../../skia/Matrix";

export interface Line2DPathEffectProps {
  children?: ReactNode | ReactNode[];
  width: number;
  matrix: SkMatrix;
}

const onDeclare = createDeclaration<Line2DPathEffectProps>(
  ({ width, matrix }, children) => {
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
