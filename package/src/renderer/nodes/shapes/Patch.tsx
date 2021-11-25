import type { CustomPaintProps, SkEnum } from "../processors";
import {
  processPaint,
  selectPaint,
  useFrame,
  enumKey,
  processColor,
} from "../processors";
import type { IPoint } from "../../../skia";
import { BlendMode } from "../../../skia/Paint/BlendMode";

export interface PatchProps extends CustomPaintProps {
  colors: string[];
  cubics: IPoint[];
  texs?: IPoint[];
  blendMode?: SkEnum<typeof BlendMode>;
}

export const Patch = ({
  colors,
  cubics,
  texs,
  blendMode,
  ...patchProps
}: PatchProps) => {
  const onDraw = useFrame(
    (ctx) => {
      const { canvas, opacity } = ctx;
      const paint = selectPaint(ctx.paint, patchProps);
      processPaint(paint, opacity, patchProps);
      const mode = blendMode ? BlendMode[enumKey(blendMode)] : undefined;
      canvas.drawPatch(
        cubics,
        colors.map((c) => processColor(c, opacity)),
        texs,
        mode,
        paint
      );
    },
    [blendMode, colors, cubics, patchProps, texs]
  );
  return <skDrawing onDraw={onDraw} />;
};
