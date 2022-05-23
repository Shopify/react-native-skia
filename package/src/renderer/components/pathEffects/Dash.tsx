import React from "react";
import type { ReactNode } from "react";

import { Skia, isPathEffect } from "../../../skia";
import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

export interface DashPathEffectProps {
  intervals: number[];
  phase?: number;
  children?: ReactNode | ReactNode[];
}

const onDeclare = createDeclaration<DashPathEffectProps>(
  ({ intervals, phase }, children) => {
    const [child] = children.filter(isPathEffect);
    const pe = Skia.PathEffect.MakeDash(intervals, phase);
    if (child) {
      return Skia.PathEffect.MakeCompose(pe, child);
    }
    return pe;
  }
);

export const DashPathEffect = (props: AnimatedProps<DashPathEffectProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
