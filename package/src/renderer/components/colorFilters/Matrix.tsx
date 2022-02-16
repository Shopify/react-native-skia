import React from "react";
import type { ReactNode } from "react";

import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes";
import type { AnimatedProps } from "../../processors";

import { composeColorFilter } from "./Compose";

interface ColorMatrixProps {
  matrix: number[];
  children?: ReactNode | ReactNode[];
}

export const ColorMatrix = (props: AnimatedProps<ColorMatrixProps>) => {
  const declaration = useDeclaration(props, ({ matrix }, children) => {
    const cf = Skia.ColorFilter.MakeMatrix(matrix);
    return composeColorFilter(cf, children);
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
