import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { materialize } from "../../processors/Animations/Animations";

interface ColorMatrixProps {
  value: number[];
}

export const ColorMatrix = (props: AnimatedProps<ColorMatrixProps>) => {
  const onDeclare = useDeclaration(
    (ctx) => {
      const { value } = materialize(ctx, props);
      return Skia.ColorFilter.MakeMatrix(value);
    },
    [props]
  );
  return <skDeclaration onDeclare={onDeclare} />;
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
