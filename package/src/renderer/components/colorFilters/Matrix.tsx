import type { ReactNode } from "react";

import { Skia, isColorFilter } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

interface MatrixColorFilterProps {
  value: number[];
  children?: ReactNode | ReactNode[];
}

export const MatrixColorFilter = (
  props: AnimatedProps<MatrixColorFilterProps>
) => {
  const declaration = useDeclaration(props, ({ value }, children) => {
    const [child] = children.filter(isColorFilter);
    const cf = Skia.ColorFilter.MakeMatrix(value);
    if (child) {
      return Skia.ColorFilter.MakeCompose(cf, child);
    }
    return cf;
  });
  return <skDeclaration declaration={declaration} {...props} />;
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
