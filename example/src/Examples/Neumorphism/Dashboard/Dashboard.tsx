import React from "react";
import { Dimensions } from "react-native";
import type { Vector } from "@shopify/react-native-skia";
import {
  mix,
  Blur,
  Canvas,
  Circle,
  Fill,
  Group,
  LinearGradient,
  Paint,
  rect,
  useFont,
  vec,
  useTouchHandler,
  useValue,
  fitRects,
  rect2rect,
  useDerivedValue,
  useLoop,
} from "@shopify/react-native-skia";

import { Title } from "./components/Title";
import { ProgressBar } from "./components/ProgressBar";
import { Snow } from "./components/icons/Snow";
import { Control } from "./components/Control";
import { Wind } from "./components/icons/Wind";
import { Sun } from "./components/icons/Sun";
import { Power } from "./components/icons/Power";
import { Mode } from "./components/Mode";

const window = Dimensions.get("window");
const width = 390;
const height = 844;
const src = rect(0, 0, width, height);
const dst = rect(0, 0, window.width, window.height);
const rects = fitRects("cover", src, dst);
const transform = rect2rect(rects.src, rects.dst);
const offsetX = 30 + 50 + 50 + 16;
const offsetY = 464 + 4;

// const project2 = (v: Vector, tr: Transforms2d) => {
//   const matrix = processTransform2dRaw(tr);
//   const [x, y] = matrixVecMul3(matrix, [v.x, v.y, 0]);
//   return { x, y };
// };

const isInKnobArea = (pt: Vector, x: number, y: number) =>
  pt.x >= x && pt.y >= y && pt.x <= x + 25 && pt.y <= y + 25;

export const Neumorphism = () => {
  const knobActive = useValue(false);
  const t = useLoop({ duration: 3000 });
  const x = useDerivedValue(() => mix(t.current, 0, 180), [t]);
  const p0 = useValue(0);
  const progress = useDerivedValue(() => x.current / 192, [x]);
  const font = useFont(require("./components/SF-Pro-Display-Bold.otf"), 17);
  const onTouch = useTouchHandler({
    onStart: (pt) => {
      if (isInKnobArea(pt, offsetX + x.current, offsetY)) {
        knobActive.current = true;
      }
    },
    onActive: () => {
      if (knobActive.current) {
        //  x.current = clamp(pt.x - offsetX, offsetX, 192);
      }
    },
    onEnd: () => {
      knobActive.current = false;
    },
  });
  if (!font) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }} onTouch={onTouch} debug>
      <Group transform={transform}>
        <Group>
          <Paint>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, height)}
              colors={["#2A2D32", "#212326", "#131313"]}
            />
          </Paint>
          <Fill />
        </Group>
        <Group>
          <Paint>
            <Blur blur={60} />
          </Paint>
          <Circle
            color="#56CCF2"
            opacity={0.2}
            cx={width}
            cy={height}
            r={150}
          />
        </Group>
        <Title title="Climate" />
        <ProgressBar progress={progress} />
        <Control
          x={0}
          y={464}
          label="Ac"
          active={true}
          progress={progress}
          font={font}
        >
          <Snow />
        </Control>
        <Control x={0} y={464 + 75} label="Fan" font={font} progress={p0}>
          <Wind />
        </Control>
        <Control x={0} y={464 + 140} label="Heat" font={font} progress={p0}>
          <Sun />
        </Control>
        <Control
          x={0}
          y={464 + 140 + 75}
          label="Auto"
          font={font}
          progress={p0}
        >
          <Power />
        </Control>
        <Mode />
      </Group>
    </Canvas>
  );
};
