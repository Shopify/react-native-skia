import React from "react";

import type {
  CustomPaintProps,
  SkEnum,
  Vector,
  ColorProp,
} from "../../processors";
import { enumKey, processColor } from "../../processors";
import type { IPoint } from "../../../skia";
import { BlendMode } from "../../../skia/Paint/BlendMode";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { useDrawing } from "../../nodes/Drawing";

// interface PatchDefiniton {
//   top: {
//     p0: Vector;
//     c1: Vector;
//     c2: Vector;
//     p1: Vector;
//   };
//   right: {
//     c1: Vector;
//     c2: Vector;
//     p1: Vector;
//   };
//   bottom: {
//     c1: Vector;
//     c2: Vector;
//     p1: Vector;
//   };
//   left: {
//     c1: Vector;
//     c2: Vector;
//   };
// }

export interface CubicBezier {
  pos: Vector;
  c1: Vector;
  c2: Vector;
}

export interface PatchProps extends CustomPaintProps {
  colors?: readonly ColorProp[];
  patch: readonly Vector[]; //readonly [CubicBezier, CubicBezier, CubicBezier, CubicBezier];
  texture?: readonly [IPoint, IPoint, IPoint, IPoint];
  blendMode?: SkEnum<typeof BlendMode>;
}

export const Patch = (props: AnimatedProps<PatchProps>) => {
  const onDraw = useDrawing(
    props,
    ({ canvas, paint, opacity }, { colors, patch, texture, blendMode }) => {
      // If the colors are provided, the default blendMode is set to dstOver, if not, the default is set to srcOver
      const defaultBlendMode = colors ? BlendMode.DstOver : BlendMode.SrcOver;
      const mode = blendMode ? BlendMode[enumKey(blendMode)] : defaultBlendMode;
      canvas.drawPatch(
        // https://github.com/google/skia/blob/main/src/utils/SkPatchUtils.cpp#L20
        patch,
        colors ? colors.map((c) => processColor(c, opacity)) : undefined,
        texture,
        mode,
        paint
      );
    }
  );
  return <skDrawing onDraw={onDraw} {...props} />;
};
