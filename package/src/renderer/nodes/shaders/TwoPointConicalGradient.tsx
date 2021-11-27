import type { Vector } from "../../math/Vector";
import type { SkEnum } from "../processors/Paint";
import { TileMode, Skia } from "../../../skia";
import { useDeclaration } from "../Declaration";
import type { TransformProps } from "../processors/Transform";
import { localMatrix } from "../processors/Transform";
import { enumKey, processColor } from "../processors/Paint";

export interface TwoPointConicalGradientProps extends TransformProps {
  start: Vector;
  startR: number;
  end: Vector;
  endR: number;
  positions?: number[];
  colors: string[];
  mode: SkEnum<typeof TileMode>;
  flag?: number;
}

export const TwoPointConicalGradient = ({
  start,
  startR,
  end,
  endR,
  positions,
  colors,
  mode,
  flag,
  ...transformProps
}: TwoPointConicalGradientProps) => {
  const onDeclare = useDeclaration(
    ({ opacity }) => {
      return Skia.Shader.MakeTwoPointConicalGradient(
        start,
        startR,
        end,
        endR,
        colors.map((color) => processColor(color, opacity)),
        positions ?? null,
        TileMode[enumKey(mode)],
        localMatrix(transformProps),
        flag
      );
    },
    [colors, end, endR, flag, mode, positions, start, startR, transformProps]
  );
  return <skDeclaration onDeclare={onDeclare} />;
};

TwoPointConicalGradient.defaultProps = {
  mode: "clamp",
};
