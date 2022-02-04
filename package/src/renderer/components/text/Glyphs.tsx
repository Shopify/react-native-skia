import React from "react";

import type { CustomPaintProps, AnimatedProps } from "../../processors";
import { useDrawing } from "../../nodes/Drawing";
import type { IPoint, IFont } from "../../../skia";

export interface Glyph {
  id: number;
  pos: IPoint;
}

export interface GlyphsProps extends CustomPaintProps {
  x: number;
  y: number;
  glyphs: Glyph[];
  font: IFont;
}

interface ProcessedGlyphs {
  glyphs: number[];
  positions: IPoint[];
}

export const Glyphs = (props: AnimatedProps<GlyphsProps>) => {
  const onDraw = useDrawing(
    props,
    ({ canvas, paint }, { glyphs: rawGlyphs, x, y, font }) => {
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
