import type { ReactNode } from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { isPathEffect } from "../../../skia/PathEffect";

export interface DiscretePathEffectProps {
  length: number;
  deviation: number;
  seed: number;
  children?: ReactNode | ReactNode[];
}

export const DiscretePathEffect = (
  props: AnimatedProps<DiscretePathEffectProps>
) => {
  const declaration = useDeclaration(
    props,
    ({ length, deviation, seed }, children) => {
      const [child] = children.filter(isPathEffect);
      const pe = Skia.PathEffect.MakeDiscrete(length, deviation, seed);
      if (child) {
        console.log({ child });
        return Skia.PathEffect.MakeCompose(pe, child);
      }
      return pe;
    }
  );
  return <skDeclaration declaration={declaration} {...props} />;
};

DiscretePathEffect.defaultProps = {
  seed: 0,
};
