import React from "react";
import type { ReactNode } from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { Path1DEffectStyle, isPathEffect } from "../../../skia/PathEffect";
import type { IPath } from "../../../skia/Path/Path";
import { enumKey } from "../../processors/Paint";
import type { Matrix } from "../../../skia/Matrix";

export interface Path1DPathEffectProps {
  children?: ReactNode | ReactNode[];
  path: IPath | string;
  matrix: Matrix;
}

export const Path1DPathEffect = (
  props: AnimatedProps<Path1DPathEffectProps>
) => {
  const declaration = useDeclaration(props, ({ path, matrix }, children) => {
    const [child] = children.filter(isPathEffect);
    const pe = Skia.PathEffect.MakePath2D(matrix, path);
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
