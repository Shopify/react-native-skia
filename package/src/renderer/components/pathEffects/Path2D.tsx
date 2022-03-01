import React from "react";
import type { ReactNode } from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { isPathEffect } from "../../../skia/PathEffect";
import type { IMatrix } from "../../../skia/Matrix";
import type { PathDef } from "../../processors/Paths";
import { processPath } from "../../processors/Paths";

export interface Path2DPathEffectProps {
  children?: ReactNode | ReactNode[];
  matrix: IMatrix;
  path: PathDef;
}

export const Path2DPathEffect = (
  props: AnimatedProps<Path2DPathEffectProps>
) => {
  const declaration = useDeclaration(props, ({ path, matrix }, children) => {
    const [child] = children.filter(isPathEffect);
    const pe = Skia.PathEffect.MakePath2D(matrix, processPath(path));
    if (child) {
      if (!pe) {
        return child;
      }
      return Skia.PathEffect.MakeCompose(pe, child);
    }
    return pe;
  });
  return <skDeclaration declaration={declaration} {...props} />;
};
