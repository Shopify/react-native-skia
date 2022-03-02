import {
  add,
  Canvas,
  Circle,
  LinearGradient,
  Paint,
  vec,
  sub,
  Fill,
  useLoop,
  mix,
  BackdropFilter,
  Blur,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const c = vec(width / 2, height / 2);
const r = c.x - 32;
const rect = { x: 0, y: c.y, width, height: c.y };

export const Glassmorphism = () => {
  const progress = useLoop({ duration: 2000 });
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="black" />
      <Paint>
        <LinearGradient
          start={() => sub(c, vec(0, mix(progress.value, r, r / 2)))}
          end={() => add(c, vec(0, mix(progress.value, r, r / 2)))}
          colors={["#FFF723", "#E70696"]}
        />
      </Paint>
      <Circle c={c} r={() => mix(progress.value, r, r / 2)} />
      <BackdropFilter clip={rect}>
        <Blur sigmaX={10} sigmaY={10} />
        <Fill color="rgba(0, 0, 0, 0.3)" />
      </BackdropFilter>
    </Canvas>
  );
};
