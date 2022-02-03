import React from "react";

import type { CustomPaintProps } from "../../processors/Paint";
import { useDrawing } from "../../nodes/Drawing";
import type { AnimatedProps, FontDef } from "../../processors";
import type { IPoint } from "../../../skia/Point";
import { processFont } from "../../processors";

export interface Glyph {
  id: number;
  pos: IPoint;
}

export type GlyphsProps = CustomPaintProps &
  FontDef & {
    x: number;
    y: number;
    glyphs: Glyph[];
  };

interface ProcessedGlyphs {
  glyphs: number[];
  positions: IPoint[];
}

export const Glyphs = (props: AnimatedProps<GlyphsProps>) => {
  const onDraw = useDrawing(
    props,
    ({ canvas, paint, fontMgr }, { glyphs: rawGlyphs, x, y, ...fontDef }) => {
      const font = processFont(fontMgr, fontDef);
      const { glyphs, positions } = rawGlyphs.reduce<ProcessedGlyphs>(
        (acc, glyph) => {
          const { id, pos } = glyph;
          acc.glyphs.push(id);
          acc.positions.push(pos);
          return acc;
        },
        { glyphs: [], positions: [] }
      );
      canvas.drawGlyphs(glyphs, positions, x, y, font, paint);
    }
  );
  return <skDrawing onDraw={onDraw} {...props} />;
};
