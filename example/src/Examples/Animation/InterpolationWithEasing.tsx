import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import { Canvas, Easing, useTiming } from "@shopify/react-native-skia";

import { AnimationElement, AnimationDemo, Size, Padding } from "./Components";

const { width } = Dimensions.get("window");

export const InterpolationWithEasing = () => {
  const progress = useTiming(
    {
      from: 10,
      to: width - Size - Padding,
      yoyo: true,
    },
    { duration: 1000, easing: Easing.inOut(Easing.cubic) }
  );
  return (
    <AnimationDemo title={"Interpolating value using an easing."}>
      <Canvas style={styles.canvas}>
        <AnimationElement x={progress} />
      </Canvas>
    </AnimationDemo>
  );
};

const styles = StyleSheet.create({
  canvas: {
    height: 80,
    width: width - Padding,
    backgroundColor: "#FEFEFE",
  },
});
