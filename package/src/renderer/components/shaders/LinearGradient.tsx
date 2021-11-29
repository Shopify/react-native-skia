import type { Vector, AnimatedProps } from "../../processors";
import { Skia } from "../../../skia";
import { useDeclaration } from "../../nodes/Declaration";
import { materialize } from "../../processors";

import type { GradientProps } from "./Gradient";
import { processGradientProps } from "./Gradient";

export interface LinearGradientProps extends GradientProps {
  start: Vector;
  end: Vector;
}

export const LinearGradient = (props: AnimatedProps<LinearGradientProps>) => {
  const onDeclare = useDeclaration(
    (ctx) => {
      const { start, end, ...gradientProps } = materialize(ctx, props);
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
    },
    [props]
  );
  return <skDeclaration onDeclare={onDeclare} />;
};
