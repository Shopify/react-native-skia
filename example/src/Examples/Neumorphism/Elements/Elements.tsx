import React from "react";
import { Dimensions } from "react-native";
import {
  Canvas,
  Fill,
  useValue,
  useTouchHandler,
  runTiming,
} from "@shopify/react-native-skia";

import { Switch } from "./components/Switch";

const { width, height } = Dimensions.get("window");
const PADDING = 32;
const size = width - PADDING * 2;
const x = PADDING;
const y = (height - size) / 2;

export const Neumorphism = () => {
  const value = useValue(0);
  const onTouch = useTouchHandler({
    onEnd: () => {
      runTiming(value, value.current ? 0 : 1, { duration: 250 });
    },
  });
  return (
    <Canvas style={{ flex: 1 }} onTouch={onTouch} debug>
      <Fill color="#F0F0F3" />
      <Switch x={x} y={y} width={size} value={value} />
    </Canvas>
  );
};
