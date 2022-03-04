import React from "react";

import type { CustomPaintProps, AnimatedProps } from "../../processors";
import { useDrawing } from "../../nodes/Drawing";
import type { SkPoint } from "../../../skia";
import type { FontDef } from "../../processors/Font";
import { processFont } from "../../processors/Font";

export interface Glyph {
  id: number;
  pos: SkPoint;
}

export type GlyphsProps = CustomPaintProps &
  FontDef & {
    x: number;
    y: number;
    glyphs: Glyph[];
  };

interface ProcessedGlyphs {
  glyphs: number[];
  positions: SkPoint[];
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

Glyphs.defaultProps = {
  x: 0,
  y: 0,
};
