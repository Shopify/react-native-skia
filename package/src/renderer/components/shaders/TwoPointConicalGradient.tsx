import React from "react";

import type { Vector, AnimatedProps } from "../../processors";
import { Skia } from "../../../skia";
import { createDeclaration } from "../../nodes/Declaration";

import type { GradientProps } from "./Gradient";
import { processGradientProps } from "./Gradient";

export interface TwoPointConicalGradientProps extends GradientProps {
  start: Vector;
  startR: number;
  end: Vector;
  endR: number;
}

const onDeclare = createDeclaration<TwoPointConicalGradientProps>(
  ({ start, startR, end, endR, ...gradientProps }) => {
    const { colors, positions, mode, localMatrix, flags } =
      processGradientProps(gradientProps);
    return Skia.Shader.MakeTwoPointConicalGradient(
      start,
      startR,
      end,
      endR,
      colors,
      positions,
      mode,
      localMatrix,
      flags
    );
  }
);

export const TwoPointConicalGradient = (
  props: AnimatedProps<TwoPointConicalGradientProps>
) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
