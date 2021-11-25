import type { CustomPaintProps, SkEnum } from "../processors";
import { processPaint, selectPaint, useFrame } from "../processors";
import type { IPoint } from "../../../skia";
import { PointMode } from "../../../skia";
import { enumKey } from "../processors/Paint";

export interface PointsProps extends CustomPaintProps {
  points: IPoint[];
  mode: SkEnum<typeof PointMode>;
}

export const Points = ({ points, mode, ...pointProps }: PointsProps) => {
  const onDraw = useFrame(
    (ctx) => {
      const { canvas, opacity } = ctx;
      const paint = selectPaint(ctx.paint, pointProps);
      processPaint(paint, opacity, pointProps);
      const pointMode = PointMode[enumKey(mode)];
      canvas.drawPoints(pointMode, points, paint);
    },
    [mode, pointProps, points]
  );
  return <skDrawing onDraw={onDraw} />;
};
