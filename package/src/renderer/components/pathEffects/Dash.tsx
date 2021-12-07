import React from "react";
import type { ReactNode } from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { isPathEffect } from "../../../skia/PathEffect";

export interface DashPathEffectProps {
  intervals: number[];
  phase?: number;
  children?: ReactNode | ReactNode[];
}

export const DashPathEffect = (props: AnimatedProps<DashPathEffectProps>) => {
  const declaration = useDeclaration(
    props,
    ({ intervals, phase }, children) => {
      const [child] = children.filter(isPathEffect);
      const pe = Skia.PathEffect.MakeDash(intervals, phase);
      if (child) {
        return Skia.PathEffect.MakeCompose(pe, child);
      }
      return pe;
    }
  );
  return <skDeclaration declaration={declaration} {...props} />;
};
