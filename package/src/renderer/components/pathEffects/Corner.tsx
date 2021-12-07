import type { ReactNode } from "react";
import React from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { isPathEffect } from "../../../skia/PathEffect";

export interface CornerPathEffectProps {
  r: number;
  children?: ReactNode | ReactNode[];
}

export const CornerPathEffect = (
  props: AnimatedProps<CornerPathEffectProps>
) => {
  const declaration = useDeclaration(props, ({ r }, children) => {
    const [child] = children.filter(isPathEffect);
    const pe = Skia.PathEffect.MakeCorner(r);
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
