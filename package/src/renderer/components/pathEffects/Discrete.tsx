import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

export interface DiscreteProps {
  length: number;
  deviation: number;
  seed: number;
}

export const Discrete = (props: AnimatedProps<DiscreteProps>) => {
  const declaration = useDeclaration(props, ({ length, deviation, seed }) => {
    return Skia.PathEffect.MakeDiscrete(length, deviation, seed);
  });
  return <skDeclaration declaration={declaration} />;
};

Discrete.defaultProps = {
  seed: 0,
};
