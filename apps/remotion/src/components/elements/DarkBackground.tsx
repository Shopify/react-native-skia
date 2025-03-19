import type { Vector } from "@exodus/react-native-skia";
import {
  vec,
  bottomLeft,
  bottomRight,
  Line,
  topLeft,
  topRight,
  Group,
  RadialGradient,
  rect,
  Fill,
} from "@exodus/react-native-skia";
import { interpolate, useCurrentFrame } from "remotion";

import { CLAMP } from "../animations";
import { CANVAS, center } from "../Theme";

const { width, height } = CANVAS;
const SIZE = 200;
const ROWS = Math.round(height / SIZE);
const COLS = Math.round(width / SIZE);

interface DarkBackgroundProps {
  c: Vector;
}

export const DarkBackground = ({ c }: DarkBackgroundProps) => {
  const secs = 30 * 4;
  const frame = Math.max(useCurrentFrame(), 0);
  const progress = interpolate(frame % secs, [0, secs], [0, 1], CLAMP);
  const count = Math.floor(frame / secs);
  return (
    <>
      <Fill dither={true}>
        <RadialGradient c={c} r={width} colors={["#303030", "#040404"]} />
      </Fill>
      {new Array(COLS).fill(0).map((_i, i) =>
        new Array(ROWS).fill(0).map((_j, j) => {
          const x = SIZE / 2 + i * SIZE;
          const y = SIZE / 2 + j * SIZE;
          const r = 8;
          const rct = rect(x - r, y - r, 2 * r, 2 * r);
          return (
            <Group
              key={`${i}-${j}`}
              color="#5E5E5E"
              style="stroke"
              strokeWidth={2}
              transform={[
                {
                  rotate:
                    (count * Math.PI) / 4 +
                    interpolate(progress, [0, 0.05], [0, Math.PI / 4], CLAMP),
                },
              ]}
              origin={vec(x, y)}
            >
              <Line p1={topLeft(rct)} p2={bottomRight(rct)} />
              <Line p1={bottomLeft(rct)} p2={topRight(rct)} />
            </Group>
          );
        })
      )}
    </>
  );
};

//vec(width, center.y)
DarkBackground.defaultProps = {
  c: center,
};
