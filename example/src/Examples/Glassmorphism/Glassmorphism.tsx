import {
  add,
  Canvas,
  Circle,
  LinearGradient,
  vec,
  sub,
  Fill,
  useLoop,
  mix,
  BackdropFilter,
  Blur,
  useDerivedValue,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const c = vec(width / 2, height / 2);
const r = c.x - 32;
const rect = { x: 0, y: c.y, width, height: c.y };

export const Glassmorphism = () => {
  const progress = useLoop({ duration: 2000 });
  const start = useDerivedValue(
    () => sub(c, vec(0, mix(progress.current, r, r / 2))),
    [progress]
  );
  const end = useDerivedValue(
    () => add(c, vec(0, mix(progress.current, r, r / 2))),
    []
  );
  const radius = useDerivedValue(
    () => mix(progress.current, r, r / 2),
    [progress]
  );

  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="black" />
      <Circle c={c} r={radius}>
        <LinearGradient
          start={start}
          end={end}
          colors={["#FFF723", "#E70696"]}
        />
      </Circle>
      <BackdropFilter filter={<Blur blur={10} />} clip={rect}>
        <Fill color="rgba(0, 0, 0, 0.3)" />
      </BackdropFilter>
    </Canvas>
  );
};
