import type { ReactNode } from "react";
import React from "react";

import { Skia, isPathEffect } from "../../../skia";
import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

export interface CornerPathEffectProps {
  r: number;
  children?: ReactNode | ReactNode[];
}

const onDeclare = createDeclaration<CornerPathEffectProps>(
  ({ r }, children) => {
    const [child] = children.filter(isPathEffect);
    const pe = Skia.PathEffect.MakeCorner(r);
    if (child) {
      if (!pe) {
        return child;
      }
      return Skia.PathEffect.MakeCompose(pe, child);
    }
    return pe;
  }
);

export const CornerPathEffect = (
  props: AnimatedProps<CornerPathEffectProps>
) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
