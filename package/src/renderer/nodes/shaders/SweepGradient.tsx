import type { Vector } from "../../math/Vector";
import { Skia } from "../../../skia";
import { useDeclaration } from "../Declaration";

import type { GradientProps } from "./Gradient";
import { processGradientProps } from "./Gradient";

export interface SweepGradientProps extends GradientProps {
  c: Vector;
  startAngleInDegrees?: number;
  endAngleInDegrees?: number;
}

export const SweepGradient = ({
  c,
  startAngleInDegrees,
  endAngleInDegrees,
  ...gradientProps
}: SweepGradientProps) => {
  const onDeclare = useDeclaration(() => {
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
  }, [c.x, c.y, endAngleInDegrees, gradientProps, startAngleInDegrees]);
  return <skDeclaration onDeclare={onDeclare} />;
};
