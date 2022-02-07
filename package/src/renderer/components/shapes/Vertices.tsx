import React from "react";

import type { CustomPaintProps, SkEnum } from "../../processors";
import { enumKey, processColor } from "../../processors";
import type { IPoint } from "../../../skia";
import { BlendMode } from "../../../skia/Paint/BlendMode";
import type { AnimatedProps } from "../../processors/Animations/Animations";
import { useDrawing } from "../../nodes/Drawing";
import { VertexMode } from "../../../skia/Vertices/Vertices";
import { Skia } from "../../../skia/Skia";

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
