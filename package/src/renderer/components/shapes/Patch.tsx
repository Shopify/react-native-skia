import React from "react";

import type { CustomPaintProps, SkEnum } from "../../processors";
import { enumKey, processColor } from "../../processors";
import type { IPoint } from "../../../skia";
import { BlendMode } from "../../../skia/Paint/BlendMode";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { useDrawing } from "../../nodes/Drawing";

export interface PatchProps extends CustomPaintProps {
  colors: string[];
  cubics: IPoint[];
  texs?: IPoint[];
  blendMode?: SkEnum<typeof BlendMode>;
}

export const Patch = (props: AnimatedProps<PatchProps>) => {
  const onDraw = useDrawing(
    props,
    ({ canvas, paint, opacity }, { colors, cubics, texs, blendMode }) => {
      const mode = blendMode ? BlendMode[enumKey(blendMode)] : undefined;
      canvas.drawPatch(
        cubics,
        colors.map((c) => processColor(c, opacity)),
        texs,
        mode,
        paint
      );
    }
  );
  return <skDrawing onDraw={onDraw} {...props} />;
};
