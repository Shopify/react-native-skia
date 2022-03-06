import React from "react";

import type { CustomPaintProps, AnimatedProps } from "../../processors";
import { useDrawing, useBounds } from "../../nodes/Drawing";
import type { SkPoint } from "../../../skia";
import type { FontDef } from "../../processors/Font";
import { processFont } from "../../processors/Font";
import { bounds, rect } from "../../processors/Rects";

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
  const onBounds = useBounds(
    props,
    ({ fontMgr }, { glyphs: rawGlyphs, x, y, ...fontDef }) => {
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

      // TODO: measure glyph width and height
      // use getBounds() https://api.skia.org/classSkFont.html
      console.log({ font, glyphs });
      return bounds(
        positions.map((pt) => {
          return rect(pt.x, pt.y, 100, 100);
        })
      );
    }
  );
  return <skDrawing onDraw={onDraw} onBounds={onBounds} {...props} />;
};

Glyphs.defaultProps = {
  x: 0,
  y: 0,
};
