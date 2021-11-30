import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

interface MatrixProps {
  value: number[];
}

export const Matrix = (props: AnimatedProps<MatrixProps>) => {
  const declaration = useDeclaration(props, ({ value }) => {
    return Skia.ColorFilter.MakeMatrix(value);
  });
  return <skDeclaration declaration={declaration} />;
};

export const OpacityMatrix = (opacity: number) => [
  1,
  0,
  0,
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  0,
  0,
  1,
  0,
  0,
  0,
  0,
  0,
  opacity,
  0,
];
