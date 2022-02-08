import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import {
  Canvas,
  mix,
  useAnimationValue,
  useDerivedValue,
} from "@shopify/react-native-skia";

import { AnimationElement, AnimationDemo, Padding } from "./Components";

const { width } = Dimensions.get("window");

export const SimpleValueOverTime = () => {
  const progress = useAnimationValue();
  const value = useDerivedValue(
    (p) => mix((p / 1000) % 1, 10, width - 20),
    [progress]
  );
  return (
    <AnimationDemo title={"Simple animation of value over time"}>
      <Canvas style={styles.canvas}>
        <AnimationElement x={value} />
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
