import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import { Canvas, Circle, Easing, useTiming } from "@shopify/react-native-skia";

import { AnimationDemo, Size, Padding } from "./Components";

const { width } = Dimensions.get("window");

export const InterpolationWithEasing = () => {
  const progress = useTiming(
    {
      from: 20,
      to: width - (Size + Padding),
      loop: true,
      yoyo: true,
    },
    { duration: 1000, easing: Easing.inOut(Easing.cubic) }
  );
  return (
    <AnimationDemo title={"Interpolating value using an easing."}>
      <Canvas style={styles.canvas}>
        <Circle cx={progress} cy={40} r={15} color="#DC4C4C" />
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
