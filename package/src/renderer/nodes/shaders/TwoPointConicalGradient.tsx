import type { Vector } from "../../math/Vector";
import { Skia } from "../../../skia";
import { useDeclaration } from "../Declaration";
import type { AnimatedProps } from "../processors/Animations/Animations";
import { materialize } from "../processors/Animations/Animations";

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
  const onDeclare = useDeclaration(
    (ctx) => {
      const { start, startR, end, endR, ...gradientProps } = materialize(
        ctx,
        props
      );
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
    },
    [props]
  );
  return <skDeclaration onDeclare={onDeclare} />;
};
