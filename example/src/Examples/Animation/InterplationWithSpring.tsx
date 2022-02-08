import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import { Canvas, Spring, useSpring } from "@shopify/react-native-skia";

import { AnimationElement, AnimationDemo, Size, Padding } from "./Components";

const { width } = Dimensions.get("window");

export const InterpolationWithSpring = () => {
  const progress = useSpring(
    {
      from: (width - Size - Padding) * 0.25,
      to: (width - Size - Padding) * 0.75,
      yoyo: true,
    },
    Spring.Config.Wobbly
  );
  return (
    <AnimationDemo title={"Interpolating value using a spring."}>
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
