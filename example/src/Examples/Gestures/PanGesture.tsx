import React from "react";
import { Canvas, Circle, Image, useImage } from "@shopify/react-native-skia";
import { Dimensions, StyleSheet } from "react-native";

import { GestureDemo, Padding } from "./Components";

const { width } = Dimensions.get("window");

export const PanGesture = () => {
  const oslo = useImage(require("../../assets/oslo.jpg"));
  console.log(oslo);
  if (oslo === null) {
    return null;
  }

  return (
    <GestureDemo title="Pan Gesture">
      <Canvas style={styles.canvas}>
        <Circle cx={width / 2} cy={40} r={30} />
      </Canvas>
    </GestureDemo>
  );
};

const styles = StyleSheet.create({
  canvas: {
    height: 80,
    width: width - Padding,
    backgroundColor: "#FEFEFE",
  },
});
