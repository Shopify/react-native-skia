import React from "react";

import type { Vector, AnimatedProps } from "../../processors";
import { createDeclaration } from "../../nodes/Declaration";

import type { GradientProps } from "./Gradient";
import { processGradientProps } from "./Gradient";

export interface LinearGradientProps extends GradientProps {
  start: Vector;
  end: Vector;
}

const onDeclare = createDeclaration<LinearGradientProps>(
  ({ start, end, ...gradientProps }, _, { Skia }) => {
    const { colors, positions, mode, localMatrix, flags } =
      processGradientProps(Skia, gradientProps);
    return Skia.Shader.MakeLinearGradient(
      start,
      end,
      colors,
      positions,
      mode,
      localMatrix,
      flags
    );
  }
);

export const LinearGradient = (props: AnimatedProps<LinearGradientProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
