import React from "react";
import type { IPath, IRect } from "@shopify/react-native-skia";
import { rect, vec, Path, Group } from "@shopify/react-native-skia";
import {
  fitRects,
  rect2rect,
} from "@shopify/react-native-skia/src/renderer/components/image/BoxFit";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
export const COLS = 16;
export const ROWS = 20;
export const GLYPH = { width: width / COLS, height: height / ROWS };

/* eslint-disable max-len */
// https://scifi.stackexchange.com/questions/137575/is-there-a-list-of-the-symbols-shown-in-the-matrixthe-symbols-rain-how-many
const PADDING = 6;
const viewBox = (src: IRect, dest: IRect) => {
  const rects = fitRects("contain", src, dest);
  const tr = rect2rect(rects.src, rects.dst);
  return tr;
};

interface State {
  opacity: number;
  color: string;
}

interface GlyphProps {
  x: number;
  y: number;
  glyphs: { path: IPath; bounds: IRect }[];
  state: State;
}

export const Glyph = ({
  x,
  y,
  glyphs,
  state: { opacity, color },
}: GlyphProps) => {
  const i = 0;
  const { path, bounds } = glyphs[i];
  return (
    <Group
      transform={[{ scaleY: -1 }]}
      origin={vec(
        x + PADDING + (GLYPH.width - 2 * PADDING) / 2,
        y + PADDING + (GLYPH.height - 2 * PADDING) / 2
      )}
    >
      <Group
        transform={viewBox(
          bounds,
          rect(
            x + PADDING,
            y + PADDING,
            GLYPH.width - 2 * PADDING,
            GLYPH.height - 2 * PADDING
          )
        )}
      >
        <Path color={color} path={path} opacity={opacity} />
      </Group>
    </Group>
  );
};
