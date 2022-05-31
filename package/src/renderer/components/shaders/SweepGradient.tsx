import React from "react";

import type { AnimatedProps } from "../../processors";
import { createDeclaration } from "../../nodes/Declaration";
import type { Vector } from "../../../skia/types";

import type { GradientProps } from "./Gradient";
import { processGradientProps } from "./Gradient";

export interface SweepGradientProps extends GradientProps {
  c: Vector;
  start?: number;
  end?: number;
}

const onDeclare = createDeclaration<SweepGradientProps>(
  ({ c, start, end, ...gradientProps }, _, { Skia }) => {
    const { colors, positions, mode, localMatrix, flags } =
      processGradientProps(Skia, gradientProps);
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

export const SweepGradient = (props: AnimatedProps<SweepGradientProps>) => {
  return <skDeclaration onDeclare={onDeclare} {...props} />;
};
