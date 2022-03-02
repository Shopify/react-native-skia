import React from "react";

import type { CustomPaintProps, SkEnum, AnimatedProps } from "../../processors";
import { enumKey } from "../../processors";
import type { IPoint } from "../../../skia";
import { BlendMode, VertexMode, Skia, processColor } from "../../../skia";
import { useDrawing } from "../../nodes";

export interface VerticesProps extends CustomPaintProps {
  colors?: string[];
  vertices: IPoint[];
  textures?: IPoint[];
  mode: SkEnum<typeof VertexMode>;
  blendMode?: SkEnum<typeof BlendMode>;
  indices?: number[];
}

export const Vertices = (props: AnimatedProps<VerticesProps>) => {
  const onDraw = useDrawing(
    props,
    (
      { canvas, paint, opacity },
      { colors, vertices, textures, blendMode, mode, indices }
    ) => {
      // If the colors are provided, the default blendMode is set to dstOver, if not, the default is set to srcOver
      const defaultBlendMode = colors ? BlendMode.DstOver : BlendMode.SrcOver;
      const blend = blendMode
        ? BlendMode[enumKey(blendMode)]
        : defaultBlendMode;
      const vertexMode = mode
        ? VertexMode[enumKey(mode)]
        : VertexMode.Triangles;
      const vert = Skia.MakeVertices(
        vertexMode,
        vertices,
        textures,
        colors ? colors.map((c) => processColor(c, opacity)) : undefined,
        indices
      );
      canvas.drawVertices(vert, blend, paint);
    }
  );
  return <skDrawing onDraw={onDraw} {...props} />;
};

Vertices.defaultProps = {
  mode: "triangles",
};
