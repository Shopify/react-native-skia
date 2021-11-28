import type { CustomPaintProps, SkEnum } from "../../processors";
import { enumKey, processColor } from "../../processors";
import type { IPoint } from "../../../skia";
import { BlendMode } from "../../../skia/Paint/BlendMode";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { materialize } from "../../processors/Animations/Animations";
import { useDrawing } from "../../nodes/Drawing";

export interface PatchProps extends CustomPaintProps {
  colors: string[];
  cubics: IPoint[];
  texs?: IPoint[];
  blendMode?: SkEnum<typeof BlendMode>;
}

export const Patch = (props: AnimatedProps<PatchProps>) => {
  const onDraw = useDrawing(
    (ctx) => {
      const { canvas, paint, opacity } = ctx;
      const { colors, cubics, texs, blendMode } = materialize(ctx, props);
      const mode = blendMode ? BlendMode[enumKey(blendMode)] : undefined;
      canvas.drawPatch(
        cubics,
        colors.map((c) => processColor(c, opacity)),
        texs,
        mode,
        paint
      );
    },
    [props]
  );
  return <skDrawing onDraw={onDraw} {...props} />;
};
