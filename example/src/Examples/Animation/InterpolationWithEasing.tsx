import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Circle,
  Easing,
  Fill,
  mix,
  useComputedValue,
  useLoop,
} from "@shopify/react-native-skia";

import { AnimationDemo, Size, Padding } from "./Components";

export const InterpolationWithEasing = () => {
  const { width } = useWindowDimensions();
  // Create timing loop
  const progress = useLoop({
    duration: 1000,
    easing: Easing.inOut(Easing.cubic),
  });
  // Animate position of circle
  const position = useComputedValue(
    () => mix(progress.current, 10, width - (Size + Padding)),
    [progress]
  );
  // Animate radius of circle
  const radius = useComputedValue(() => 5 + progress.current * 55, [progress]);
  return (
    <AnimationDemo title={"Interpolating value using an easing"}>
      <Canvas style={styles.canvas}>
        <Fill color="white" />
        <Circle cx={position} cy={20} r={radius} color="#DC4C4C" />
      </Canvas>
    </AnimationDemo>
  );
};

const styles = StyleSheet.create({
  canvas: {
    height: 40,
    width: "100%",
    backgroundColor: "#FEFEFE",
  },
});
