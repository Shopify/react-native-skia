import React from "react";

import type { Vector, AnimatedProps } from "../../processors";
import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";

import type { GradientProps } from "./Gradient";
import { processGradientProps } from "./Gradient";

export interface SweepGradientProps extends GradientProps {
  c: Vector;
  start?: number;
  end?: number;
}

export const SweepGradient = (props: AnimatedProps<SweepGradientProps>) => {
  const declaration = useDeclaration(
    props,
    ({ c, start, end, ...gradientProps }) => {
      const { colors, positions, mode, localMatrix, flags } =
        processGradientProps(gradientProps);
      return Skia.Shader.MakeSweepGradient(
        c.x,
        c.y,
        colors,
        positions,
        mode,
        localMatrix,
        flags,
        start,
        end
      );
    }
  );
  return <skDeclaration declaration={declaration} />;
};
