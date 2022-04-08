import {
  Canvas,
  Fill,
  Group,
  Rect,
  rect,
  useCanvasSize,
  useDerivedValue,
} from "@shopify/react-native-skia";
import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

const MyComp = () => {
  const canvas = useCanvasSize();
  const rct = useDerivedValue(() => {
    return rect(0, 0, canvas.current.width, canvas.current.height / 2);
  }, [canvas]);
  return (
    <Group>
      <Fill color="magenta" />
      <Rect color="cyan" rect={rct} />
    </Group>
  );
};

export const UseCanvas = () => {
  const height = useRef(new Animated.Value(0));
  useEffect(() => {
    Animated.loop(
      Animated.timing(height.current, {
        toValue: 500,
        duration: 4000,
        useNativeDriver: false,
      })
    ).start();
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <Canvas style={{ flex: 1 }}>
        <MyComp />
      </Canvas>
      <Animated.View style={{ height: height.current }} />
    </View>
  );
};
