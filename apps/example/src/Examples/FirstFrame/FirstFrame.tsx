import React, { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { Canvas, Circle } from "@shopify/react-native-skia";

export const FirstFrame = () => {
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <Button onPress={() => setCount((value) => value + 1)} title="TEST" />
      <Text>{count}</Text>
      <Canvas style={styles.canvas} key={count}>
        <Circle cx={100} cy={100} r={50} color="red" />
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  canvas: {
    width: 200,
    height: 200,
    backgroundColor: "lightblue",
  },
});

