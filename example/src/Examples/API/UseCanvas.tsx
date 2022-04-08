import {
  Canvas,
  Fill,
  Group,
  Paint,
  rect,
  rrect,
  useCanvas,
  useDerivedValue,
} from "@shopify/react-native-skia";
import React, { useState, useEffect } from "react";
import { View } from "react-native";

const Gradient = () => {
  const canvas = useCanvas();
  const rct = useDerivedValue(() => {
    console.log({ height: canvas.current.height });
    return rect(0, 0, canvas.current.width, canvas.current.height);
  }, []);
  return (
    <Group>
      <Paint />
      <Fill />
    </Group>
  );
};

export const UseCanvas = () => {
  const [height, setHeight] = useState(100);
  useEffect(() => {
    setInterval(() => {
      setHeight(Math.random() * 300);
    }, 2000);
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <Canvas style={{ flex: 1 }}>
        <Gradient />
      </Canvas>
      <View style={{ height }} />
    </View>
  );
};
