import React from "react";

import type { CustomPaintProps, SkEnum, AnimatedProps } from "../../processors";
import { enumKey } from "../../processors";
import type { SkPoint } from "../../../skia/types";
import { BlendMode, VertexMode } from "../../../skia/types";
import { createDrawing } from "../../nodes";
import { processColor } from "../../processors/Color";

export interface VerticesProps extends CustomPaintProps {
  colors?: string[];
  vertices: SkPoint[];
  textures?: SkPoint[];
  mode: SkEnum<typeof VertexMode>;
  blendMode?: SkEnum<typeof BlendMode>;
  indices?: number[];
}

const onDraw = createDrawing<VerticesProps>(
  (
    { canvas, paint, opacity, Skia },
    { colors, vertices, textures, blendMode, mode, indices }
  ) => {
    // If the colors are provided, the default blendMode is set to dstOver, if not, the default is set to srcOver
    const defaultBlendMode = colors ? BlendMode.DstOver : BlendMode.SrcOver;
    const blend = blendMode ? BlendMode[enumKey(blendMode)] : defaultBlendMode;
    const vertexMode = mode ? VertexMode[enumKey(mode)] : VertexMode.Triangles;
    const vert = Skia.MakeVertices(
      vertexMode,
      vertices,
      textures,
      colors ? colors.map((c) => processColor(Skia, c, opacity)) : undefined,
      indices
    );
    canvas.drawVertices(vert, blend, paint);
  }
);

export const Vertices = (props: AnimatedProps<VerticesProps>) => {
  return <skDrawing onDraw={onDraw} {...props} />;
};

Vertices.defaultProps = {
  mode: "triangles",
};
