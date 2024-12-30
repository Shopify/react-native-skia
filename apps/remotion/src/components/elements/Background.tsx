import {
  Circle,
  Fill,
  Group,
  RadialGradient,
} from "@shopify/react-native-skia";
import { interpolate, random, useCurrentFrame } from "remotion";
import { createNoise3D } from "simplex-noise";

import { CANVAS, center } from "../Theme";

//const DRAW_NOISE = true;
const opacityNoise = createNoise3D(() => random("opacity"));
const margin = 100;
const colors = ["#fdfdfd", "#f0f0f0"];
const xNoise = createNoise3D(() => random("x"));
const yNoise = createNoise3D(() => random("y"));

export const Background = () => {
  const width = CANVAS.width + margin;
  const height = CANVAS.height + margin;
  const frame = useCurrentFrame();
  const SIZE = 120;
  const ROWS = Math.round(height / SIZE);
  const COLS = Math.round(width / SIZE);
  const F = 0.004;
  return (
    <>
      <Fill>
        <RadialGradient c={center} r={center.x} colors={colors} />
      </Fill>
      <Group
        transform={[{ translateX: -margin / 2 }, { translateY: -margin / 2 }]}
      >
        {new Array(COLS).fill(0).map((_i, i) =>
          new Array(ROWS).fill(0).map((_j, j) => {
            const x = i * SIZE;
            const y = j * SIZE;
            const px = i / COLS;
            const py = j / ROWS;
            const dx = xNoise(px, py, frame * F) * SIZE;
            const dy = yNoise(px, py, frame * F) * SIZE;
            const alpha = interpolate(
              opacityNoise(px, py, frame * F),
              [-1, 1],
              [0.5, 1]
            );
            return (
              <Circle
                cx={x + dx}
                cy={y + dy}
                r={5}
                color={`rgba(225, 225, 225, ${
                  Math.round(alpha * 1000) / 1000
                })`}
                key={`${i}-${j}`}
              />
            );
          })
        )}
      </Group>
    </>
  );
};
