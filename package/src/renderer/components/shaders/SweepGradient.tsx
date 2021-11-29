import type { Vector, AnimatedProps } from "../../processors";
import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";

import type { GradientProps } from "./Gradient";
import { processGradientProps } from "./Gradient";

export interface SweepGradientProps extends GradientProps {
  c: Vector;
  startAngleInDegrees?: number;
  endAngleInDegrees?: number;
}

export const SweepGradient = (props: AnimatedProps<SweepGradientProps>) => {
  const declaration = useDeclaration(
    props,
    ({ c, startAngleInDegrees, endAngleInDegrees, ...gradientProps }) => {
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
        startAngleInDegrees,
        endAngleInDegrees
      );
    }
  );
  return <skDeclaration declaration={declaration} />;
};
