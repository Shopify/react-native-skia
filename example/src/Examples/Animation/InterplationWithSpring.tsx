import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import { Canvas, Spring, useValue, useLoop } from "@shopify/react-native-skia";

import { AnimationElement, AnimationDemo, Size, Padding } from "./Components";

const { width } = Dimensions.get("window");

export const InterpolationWithSpring = () => {
  const progress = useValue(0);
  useLoop(
    progress,
    Spring.create(
      {
        from: (width - Size - Padding) * 0.25,
        to: (width - Size - Padding) * 0.75,
      },
      Spring.Wobbly()
    ),
    { yoyo: true }
  );
  return (
    <AnimationDemo title={"Interpolating value using a spring."}>
      <Canvas style={styles.canvas}>
        <AnimationElement x={() => progress.value} />
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
