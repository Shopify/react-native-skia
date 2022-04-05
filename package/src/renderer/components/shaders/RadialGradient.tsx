import React from "react";

import type { Vector, AnimatedProps } from "../../processors";
import { Skia } from "../../../skia";
import { createDeclaration } from "../../nodes/Declaration";

import type { GradientProps } from "./Gradient";
import { processGradientProps } from "./Gradient";

export interface RadialGradientProps extends GradientProps {
  c: Vector;
  r: number;
}

const onDeclare = createDeclaration<RadialGradientProps>(
  ({ c, r, ...gradientProps }) => {
    const { colors, positions, mode, localMatrix, flags } =
      processGradientProps(gradientProps);
    return Skia.Shader.MakeRadialGradient(
      c,
      r,
      colors,
      positions,
      mode,
      localMatrix,
      flags
    );
  }
);

export const RadialGradient = (props: AnimatedProps<RadialGradientProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
