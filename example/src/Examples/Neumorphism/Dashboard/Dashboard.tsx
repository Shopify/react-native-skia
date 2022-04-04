import React from "react";
import { Dimensions } from "react-native";
import {
  runSpring,
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
// import { Snow } from "./components/icons/Snow";
// import { Control } from "./components/Control";
// import { Wind } from "./components/icons/Wind";
// import { Sun } from "./components/icons/Sun";
// import { Power } from "./components/icons/Power";
import { Mode } from "./components/Mode";

const window = Dimensions.get("window");
const width = 390;
const height = 844;
const src = rect(0, 0, width, height);
const dst = rect(0, 0, window.width, window.height);
const rects = fitRects("cover", src, dst);
const transform = rect2rect(rects.src, rects.dst);

export const Neumorphism = () => {
  const translateY = useValue(0);
  const offsetY = useValue(0);
  const t = useLoop({ duration: 3000 });
  const x = useDerivedValue(() => mix(t.current, 0, 180), [t]);
  const progress = useDerivedValue(() => x.current / 192, [x]);
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
            <Blur blur={30} />
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
        {/* <Control
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
        </Control> */}
        <Mode translateY={translateY} />
      </Group>
    </Canvas>
  );
};
