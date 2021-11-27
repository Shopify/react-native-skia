import { processColor } from "../processors";
import type { Vector } from "../../math";
import { Skia, TileMode } from "../../../skia";
import { useDeclaration } from "../Declaration";

import type { GradientProps } from "./Gradient";
import { processGradientProps } from "./Gradient";

export interface RadialGradientProps extends GradientProps {
  c: Vector;
  r: number;
}

export const RadialGradient = ({
  c,
  r,
  ...gradientProps
}: RadialGradientProps) => {
  const onDeclare = useDeclaration(() => {
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
  }, [c, gradientProps, r]);
  return <skDeclaration onDeclare={onDeclare} />;
};
