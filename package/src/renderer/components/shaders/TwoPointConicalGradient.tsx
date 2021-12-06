import React from "react";

import type { Vector, AnimatedProps } from "../../processors";
import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";

import type { GradientProps } from "./Gradient";
import { processGradientProps } from "./Gradient";

export interface TwoPointConicalGradientProps extends GradientProps {
  start: Vector;
  startR: number;
  end: Vector;
  endR: number;
}

export const TwoPointConicalGradient = (
  props: AnimatedProps<TwoPointConicalGradientProps>
) => {
  const declaration = useDeclaration(
    props,
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
  return <skDeclaration declaration={declaration} />;
};
