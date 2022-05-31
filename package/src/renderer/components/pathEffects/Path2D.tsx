import React from "react";
import type { ReactNode } from "react";

import { isPathEffect } from "../../../skia/types";
import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import type { SkMatrix } from "../../../skia/types";
import type { PathDef } from "../../processors/Paths";
import { processPath } from "../../processors/Paths";

export interface Path2DPathEffectProps {
  children?: ReactNode | ReactNode[];
  matrix: SkMatrix;
  path: PathDef;
}

const onDeclare = createDeclaration<Path2DPathEffectProps>(
  ({ path, matrix }, children, { Skia }) => {
    const [child] = children.filter(isPathEffect);
    const pe = Skia.PathEffect.MakePath2D(matrix, processPath(path));
    if (child) {
      if (!pe) {
        return child;
      }
      return Skia.PathEffect.MakeCompose(pe, child);
    }
    return pe;
  }
);

export const Path2DPathEffect = (
  props: AnimatedProps<Path2DPathEffectProps>
) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
