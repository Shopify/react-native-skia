import type { IRect } from "@shopify/react-native-skia";
import {
  Skia,
  interpolateColors,
  interpolate,
  Canvas,
  Fill,
  useProgress,
} from "@shopify/react-native-skia";
import React from "react";

import { COLS, ROWS, Glyph, GLYPH } from "./Glyph";

const MIN_HEIGHT = 4;

const streams = new Array(COLS).fill(0).map((_, i) => {
  const height = MIN_HEIGHT + Math.round(Math.random() * (ROWS - MIN_HEIGHT));
  const rest = ROWS - height;
  const y = Math.round(Math.random() * rest);
  return {
    x: i * GLYPH.width,
    y: -ROWS * GLYPH.height + y * GLYPH.height,
    height: height * GLYPH.height,
    width: GLYPH.width,
  };
});

const isInRegion = (a: IRect, b: IRect) =>
  a.x + a.width > b.x &&
  a.x < b.x + b.width &&
  a.y + a.height > b.y &&
  a.y < b.y + b.height;

const getState = (offset: number, i: number, pixel: IRect) => {
  const stream = { ...streams[i], y: streams[i].y + offset };
  if (isInRegion(stream, pixel)) {
    const opacity = interpolate(
      pixel.y,
      [stream.y, stream.y + stream.height],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );
    return {
      opacity,
      color: interpolateColors(
        pixel.y,
        [stream.y + stream.height * 0.8, stream.y + stream.height],
        ["rgb(0, 255, 70)", "rgb(140, 255, 170)"]
      ),
    };
  } else {
    return {
      opacity: 0,
      color: 0,
    };
  }
};

export const Matrix = () => {
  const progress = useProgress();
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="black" />
      {new Array(COLS).fill(0).map((_i, i) => {
        return new Array(ROWS).fill(0).map((_j, j) => {
          const x = i * GLYPH.width;
          const y = j * GLYPH.height;
          const region = {
            x,
            y,
            width: GLYPH.width,
            height: GLYPH.height,
          };
          return (
            <Glyph
              key={`${i}-${j}`}
              x={x}
              y={y}
              state={() => getState(progress.value * 0.5, i, region)}
              progress={progress}
            />
          );
        });
      })}
    </Canvas>
  );
};
