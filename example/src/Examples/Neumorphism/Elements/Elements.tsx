import React from "react";
import { useWindowDimensions } from "react-native";
import {
  Canvas,
  Fill,
  useValue,
  useTouchHandler,
  runTiming,
} from "@shopify/react-native-skia";

import { Switch } from "./components/Switch";

const PADDING = 32;
const x = PADDING;
const y = 75;

export const Neumorphism = () => {
  const { width } = useWindowDimensions();
  const size = width - PADDING * 2;
  const pressed = useValue(0);
  const onTouch = useTouchHandler({
    onStart: () => {
      runTiming(pressed, pressed.current ? 0 : 1, { duration: 150 });
    },
  });
  return (
    <Canvas style={{ flex: 1 }} onTouch={onTouch}>
      <Fill color="#F0F0F3" />
      <Switch x={x} y={y} width={size} pressed={pressed} />
    </Canvas>
  );
};
