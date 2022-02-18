import React from "react";
import { StyleSheet, View, useWindowDimensions, Button } from "react-native";
import {
  Canvas,
  Fill,
  Rect,
  useDerivedValue,
  useTiming,
} from "@shopify/react-native-skia";

import { AnimationDemo, Size } from "./Components";

export const ControllableAnimation = () => {
  const { width } = useWindowDimensions();
  const value = useTiming({ to: 1, loop: true, yoyo: true });
  const rect = useDerivedValue(
    (p) => ({ x: 0, y: 10, width: p * (width * 0.75), height: Size }),
    [value]
  );
  return (
    <AnimationDemo title={"Basic animation control"}>
      <View style={styles.container}>
        <Canvas style={styles.canvas}>
          <Fill color="white" />
          <Rect rect={rect} color="#36B6D9" />
        </Canvas>
        <View style={styles.buttonContainer}>
          <Button title="▶️" onPress={value.start} />
          <Button title="⏹" onPress={value.stop} />
        </View>
      </View>
    </AnimationDemo>
  );
};

const styles = StyleSheet.create({
  canvas: {
    height: 40,
    width: "75%",
    backgroundColor: "#FEFEFE",
  },
  container: {
    flexDirection: "row",
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    flexDirection: "row",
    backgroundColor: "#FEFEFE",
  },
});
