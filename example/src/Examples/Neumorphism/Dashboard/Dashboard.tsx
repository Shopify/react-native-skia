import React from "react";
import { useWindowDimensions } from "react-native";
import {
  runSpring,
  mix,
  Blur,
  Canvas,
  Circle,
  Fill,
  Group,
  LinearGradient,
  rect,
  useFont,
  vec,
  useTouchHandler,
  useValue,
  fitRects,
  rect2rect,
  useComputedValue,
  useLoop,
} from "@shopify/react-native-skia";

import { Title } from "./components/Title";
import { ProgressBar } from "./components/ProgressBar";
// import { Snow } from "./components/icons/Snow";
// import { Control } from "./components/Control";
// import { Wind } from "./components/icons/Wind";
// import { Sun } from "./components/icons/Sun";
// import { Power } from "./components/icons/Power";
import { Mode } from "./components/Mode";
import { Control } from "./components/Control";
import { Snow } from "./components/icons/Snow";

const width = 390;
const height = 844;
const src = rect(0, 0, width, height);

export const Neumorphism = () => {
  const window = useWindowDimensions();
  const dst = rect(0, 0, window.width, window.height);
  const rects = fitRects("cover", src, dst);
  const transform = rect2rect(rects.src, rects.dst);
  const translateY = useValue(0);
  const offsetY = useValue(0);
  const t = useLoop({ duration: 3000 });
  const x = useComputedValue(() => mix(t.current, 0, 180), [t]);
  const progress = useComputedValue(() => x.current / 192, [x]);
  const font = useFont(require("./components/SF-Pro-Display-Bold.otf"), 17);
  const onTouch = useTouchHandler({
    onStart: (pt) => {
      offsetY.current = translateY.current - pt.y;
    },
    onActive: (pt) => {
      translateY.current = offsetY.current + pt.y;
    },
    onEnd: () => {
      runSpring(translateY, 0);
    },
  });
  if (!font) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }} mode="continuous" onTouch={onTouch}>
      <Group transform={transform}>
        <Group>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, height)}
            colors={["#2A2D32", "#212326", "#131313"]}
          />
          <Fill />
        </Group>
        <Group>
          <Blur blur={30} />
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
        <Mode translateY={translateY} />
      </Group>
    </Canvas>
  );
};
