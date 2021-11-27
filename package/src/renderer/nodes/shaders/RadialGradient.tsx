import { processColor } from "../processors";
import type { Vector } from "../../math";
import { Skia, TileMode } from "../../../skia";
import type { TransformProps } from "../processors/Transform";
import { useDeclaration } from "../Declaration";
import type { SkEnum } from "../processors/Paint";
import { enumKey } from "../processors/Paint";
import { localMatrix } from "../processors/Transform";

export interface RadialGradientProps extends TransformProps {
  c: Vector;
  r: number;
  colors: string[];
  positions?: number[];
  mode: SkEnum<typeof TileMode>;
  flags?: number;
}

export const RadialGradient = ({
  c,
  r,
  colors,
  positions,
  mode,
  flags,
  ...transformProps
}: RadialGradientProps) => {
  const onDeclare = useDeclaration(
    ({ opacity }) => {
      return Skia.Shader.MakeRadialGradient(
        c,
        r,
        colors.map((color) => processColor(color, opacity)),
        positions ?? null,
        TileMode[enumKey(mode)],
        localMatrix(transformProps),
        flags
      );
    },
    [c, colors, flags, mode, positions, r, transformProps]
  );
  return <skDeclaration onDeclare={onDeclare} />;
};

RadialGradient.defaultProps = {
  mode: "clamp",
};
