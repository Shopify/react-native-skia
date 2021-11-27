import type { Vector } from "../../math/Vector";
import { Skia } from "../../../skia";
import { useDeclaration } from "../Declaration";

import type { GradientProps } from "./Gradient";
import { processGradientProps } from "./Gradient";

export interface LinearGradientProps extends GradientProps {
  start: Vector;
  end: Vector;
}

export const LinearGradient = ({
  start,
  end,
  ...gradientProps
}: LinearGradientProps) => {
  const onDeclare = useDeclaration(() => {
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
  }, [end, gradientProps, start]);
  return <skDeclaration onDeclare={onDeclare} />;
};
