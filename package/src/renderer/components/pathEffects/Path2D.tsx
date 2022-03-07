import React from "react";
import type { ReactNode } from "react";

import { Skia } from "../../../skia";
import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { isPathEffect } from "../../../skia/PathEffect";
import type { SkMatrix } from "../../../skia/Matrix";
import type { PathDef } from "../../processors/Paths";
import { processPath } from "../../processors/Paths";

export interface Path2DPathEffectProps {
  children?: ReactNode | ReactNode[];
  matrix: SkMatrix;
  path: PathDef;
}

const onDeclare = createDeclaration<Path2DPathEffectProps>(
  ({ path, matrix }, children) => {
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
