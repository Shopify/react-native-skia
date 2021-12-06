import React from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import type { AnimatedProps } from "../../processors/Animations/Animations";

interface ColorMatrixProps {
  value: number[];
}

export const ColorMatrix = (props: AnimatedProps<ColorMatrixProps>) => {
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
