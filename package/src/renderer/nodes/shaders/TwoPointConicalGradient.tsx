import type { Vector } from "../../math/Vector";
import { Skia } from "../../../skia";
import { useDeclaration } from "../Declaration";

import type { GradientProps } from "./Gradient";
import { processGradientProps } from "./Gradient";

export interface TwoPointConicalGradientProps extends GradientProps {
  start: Vector;
  startR: number;
  end: Vector;
  endR: number;
}

export const TwoPointConicalGradient = ({
  start,
  startR,
  end,
  endR,
  ...gradientProps
}: TwoPointConicalGradientProps) => {
  const onDeclare = useDeclaration(() => {
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
  }, [end, endR, gradientProps, start, startR]);
  return <skDeclaration onDeclare={onDeclare} />;
};
