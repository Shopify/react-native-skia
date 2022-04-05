import React from "react";

import type {
  CustomPaintProps,
  SkEnum,
  Vector,
  AnimatedProps,
} from "../../processors";
import { enumKey } from "../../processors";
import type { SkPoint, Color } from "../../../skia";
import { BlendMode } from "../../../skia";
import { createDrawing } from "../../nodes";
import { processColor } from "../../../skia/Color";

export interface CubicBezierHandle {
  pos: Vector;
  c1: Vector;
  c2: Vector;
}

export interface PatchProps extends CustomPaintProps {
  colors?: readonly Color[];
  patch: readonly [
    CubicBezierHandle,
    CubicBezierHandle,
    CubicBezierHandle,
    CubicBezierHandle
  ];
  texture?: readonly [SkPoint, SkPoint, SkPoint, SkPoint];
  blendMode?: SkEnum<typeof BlendMode>;
}

const onDraw = createDrawing<PatchProps>(
  ({ canvas, paint, opacity }, { colors, patch, texture, blendMode }) => {
    // If the colors are provided, the default blendMode is set to dstOver, if not, the default is set to srcOver
    const defaultBlendMode = colors ? BlendMode.DstOver : BlendMode.SrcOver;
    const mode = blendMode ? BlendMode[enumKey(blendMode)] : defaultBlendMode;
    canvas.drawPatch(
      // Patch requires a path with the following constraints:
      // M tl
      // C c1 c2 br
      // C c1 c2 bl
      // C c1 c2 tl (the redundant point in the last command is removed)
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
  }
);

export const Patch = (props: AnimatedProps<PatchProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};
