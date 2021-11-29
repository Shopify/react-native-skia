import type { Vector, AnimatedProps } from "../../processors";
import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import { materialize } from "../../processors";

import type { GradientProps } from "./Gradient";
import { processGradientProps } from "./Gradient";

export interface SweepGradientProps extends GradientProps {
  c: Vector;
  startAngleInDegrees?: number;
  endAngleInDegrees?: number;
}

export const SweepGradient = (props: AnimatedProps<SweepGradientProps>) => {
  const onDeclare = useDeclaration(
    (ctx) => {
      const { c, startAngleInDegrees, endAngleInDegrees, ...gradientProps } =
        materialize(ctx, props);
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
    },
    [props]
  );
  return <skDeclaration onDeclare={onDeclare} />;
};
