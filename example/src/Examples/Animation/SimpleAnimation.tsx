import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Fill,
  Rect,
  useComputedValue,
  useClockValue,
} from "@shopify/react-native-skia";

import { AnimationDemo, Size } from "./Components";

export const SimpleAnimation = () => {
  const { width } = useWindowDimensions();
  // Clock for driving the animation
  const clock = useClockValue();
  // Normalize the clock value to a value between 0 and 1
  const normalized = useComputedValue(
    () => (clock.current / 1000) % 1.0,
    [clock]
  );
  // Create a rect as a derived value
  const rect = useComputedValue(
    () => ({ x: 0, y: 10, width: normalized.current * width, height: Size }),
    [normalized]
  );
  return (
    <AnimationDemo title={"Basic animation using derived values"}>
      <Canvas style={styles.canvas}>
        <Fill color="white" />
        <Rect rect={rect} color="#8556E5" />
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
