import React from "react";
import type { ReactNode } from "react";

import { Skia } from "../../../skia";
import { createDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { isPathEffect } from "../../../skia/PathEffect";

export interface DiscretePathEffectProps {
  length: number;
  deviation: number;
  seed: number;
  children?: ReactNode | ReactNode[];
}

const onDeclare = createDeclaration<DiscretePathEffectProps>(
  ({ length, deviation, seed }, children) => {
    const [child] = children.filter(isPathEffect);
    const pe = Skia.PathEffect.MakeDiscrete(length, deviation, seed);
    if (child) {
      return Skia.PathEffect.MakeCompose(pe, child);
    }
    return pe;
  }
);

export const DiscretePathEffect = (
  props: AnimatedProps<DiscretePathEffectProps>
) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};

DiscretePathEffect.defaultProps = {
  seed: 0,
};
