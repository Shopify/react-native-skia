import React from "react";

import type {
  CustomPaintProps,
  SkEnum,
  Vector,
  ColorProp,
} from "../../processors";
import { enumKey, processColor } from "../../processors";
import { Skia, PaintStyle } from "../../../skia";
import type { IPoint } from "../../../skia";
import { BlendMode } from "../../../skia/Paint/BlendMode";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { useDrawing } from "../../nodes/Drawing";

export interface CubicBezier {
  pos: Vector;
  c1: Vector;
  c2: Vector;
}

export interface PatchProps extends CustomPaintProps {
  colors?: readonly ColorProp[];
  patch: readonly [CubicBezier, CubicBezier, CubicBezier, CubicBezier];
  texture?: readonly [IPoint, IPoint, IPoint, IPoint];
  blendMode?: SkEnum<typeof BlendMode>;
  debug?: boolean;
}

export const Patch = (props: AnimatedProps<PatchProps>) => {
  const onDraw = useDrawing(
    props,
    (
      { canvas, paint, opacity },
      { colors, patch, texture, blendMode, debug }
    ) => {
      // If the colors are provided, the default blendMode is set to dstOver, if not, the default is set to srcOver
      const defaultBlendMode = colors ? BlendMode.DstOver : BlendMode.SrcOver;
      const mode = blendMode ? BlendMode[enumKey(blendMode)] : defaultBlendMode;
      canvas.drawPatch(
        // https://github.com/google/skia/blob/main/src/utils/SkPatchUtils.cpp#L20
        [
          patch[0].pos,
          patch[0].c2,
          patch[1].c1,
          patch[1].pos,
          patch[1].c2,
          patch[2].c1,
          patch[2].pos,
          patch[2].c2,
          patch[3].c1,
          patch[3].pos,
          patch[3].c2,
          patch[0].c1,
        ],
        colors ? colors.map((c) => processColor(c, opacity)) : undefined,
        texture,
        mode,
        paint
      );
      if (debug) {
        const debugPaint = Skia.Paint();
        debugPaint.setColor(Skia.Color("red"));
        const linePaint = debugPaint.copy();
        linePaint.setStrokeWidth(1);
        linePaint.setStyle(PaintStyle.Stroke);
        patch.forEach(({ pos, c1, c2 }) => {
          canvas.drawLine(c1.x, c1.y, pos.x, pos.y, linePaint);
          canvas.drawLine(c2.x, c2.y, pos.x, pos.y, linePaint);
          canvas.drawCircle(pos.x, pos.y, 10, debugPaint);
          canvas.drawCircle(c1.x, c1.y, 5, debugPaint);
          canvas.drawCircle(c2.x, c2.y, 5, debugPaint);
        });
      }
    }
  );
  return <skDrawing onDraw={onDraw} {...props} />;
};
