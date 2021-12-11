import React from "react";

import type { Vector, AnimatedProps } from "../../processors";
import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";

import type { GradientProps } from "./Gradient";
import { processGradientProps } from "./Gradient";

export interface LinearGradientProps extends GradientProps {
  start: Vector;
  end: Vector;
}

export const LinearGradient = (props: AnimatedProps<LinearGradientProps>) => {
  const declaration = useDeclaration(
    props,
    ({ start, end, ...gradientProps }) => {
      const { colors, positions, mode, localMatrix, flags } =
        processGradientProps(gradientProps);
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
  return <skDeclaration declaration={declaration} />;
};
