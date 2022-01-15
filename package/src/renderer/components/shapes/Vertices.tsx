import React from "react";

import type { CustomPaintProps, SkEnum } from "../../processors";
import { enumKey } from "../../processors";
import type { IPoint } from "../../../skia";
import { BlendMode } from "../../../skia/Paint/BlendMode";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { useDrawing } from "../../nodes/Drawing";
import { VertexMode } from "../../../skia/Vertices/Vertices";
import { Skia } from "../../../skia/Skia";
import { processColor } from "../../processors/Paint";

export interface VerticesProps extends CustomPaintProps {
  colors?: string[];
  positions: IPoint[];
  texs?: IPoint[];
  vertexMode?: SkEnum<typeof VertexMode>;
  blendMode?: SkEnum<typeof BlendMode>;
  indices?: number[];
}

export const Vertices = (props: AnimatedProps<VerticesProps>) => {
  const onDraw = useDrawing(
    props,
    (
      { canvas, paint, opacity },
      { colors, positions, texs, blendMode, vertexMode, indices }
    ) => {
      const blend = blendMode ? BlendMode[enumKey(blendMode)] : BlendMode.Src;
      const mode = vertexMode
        ? VertexMode[enumKey(vertexMode)]
        : VertexMode.Triangles;
      const vertices = Skia.MakeVertices(
        mode,
        positions,
        texs,
        colors ? colors.map((c) => processColor(c, opacity)) : undefined,
        indices
      );
      canvas.drawVertices(vertices, blend, paint);
    }
  );
  return <skDrawing onDraw={onDraw} {...props} />;
};
