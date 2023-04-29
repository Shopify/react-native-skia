import React from "react";
import { Dimensions, View, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { snapPoint } from "./Math";

const { width } = Dimensions.get("window");

export const Transitions = () => {
  const x = useSharedValue(0);
  const pan = Gesture.Pan()
    .onChange((pos) => {
      x.value += pos.changeX;
    })
    .onEnd(({ velocityX }) => {
      const dst = snapPoint(x.value, velocityX, [0, -width, -2 * width]);
      x.value = withTiming(dst);
    });
  const style = useAnimatedStyle(() => ({
    flex: 1,
    width: 3 * width,
    flexDirection: "row",
    transform: [{ translateX: x.value }],
  }));
  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={style}>
        <View
          style={{
            flex: 1,
            backgroundColor: "cyan",
          }}
        />
        <View
          style={{
            flex: 1,
            backgroundColor: "magenta",
          }}
        />
        <View
          style={{
            flex: 1,
            backgroundColor: "yellow",
          }}
        />
      </Animated.View>
    </GestureDetector>
  );
};
