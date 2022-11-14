import type { SkiaValue, SkSize } from "@shopify/react-native-skia";
import {
  useValue,
  Canvas,
  Fill,
  Group,
  Rect,
  rect,
  useComputedValue,
} from "@shopify/react-native-skia";
import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

interface MyCompProps {
  size: SkiaValue<SkSize>;
}

const MyComp = ({ size }: MyCompProps) => {
  const rct = useComputedValue(() => {
    return rect(0, 0, size.current.width, size.current.height / 2);
  }, [size]);
  return (
    <Group>
      <Fill color="magenta" />
      <Rect color="cyan" rect={rct} />
    </Group>
  );
};

export const UseCanvas = () => {
  const size = useValue({ width: 0, height: 0 });
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
      <Canvas style={{ flex: 1 }} onSize={size}>
        <MyComp size={size} />
      </Canvas>
      <Animated.View style={{ height: height.current }} />
    </View>
  );
};
