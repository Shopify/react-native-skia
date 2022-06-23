import { Canvas, LinearGradient, Rect, vec } from "@shopify/react-native-skia";
import React, { useState } from "react";
import { TouchableWithoutFeedback, View } from "react-native";

export const SkiaGradient = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  return (
    <Canvas style={{ width, height }}>
      <Rect x={0} y={0} width={width} height={height}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(width, 0)}
          colors={["red", "cyan", "lime"]}
        />
      </Rect>
    </Canvas>
  );
};

export const PerformanceGradients = () => {
  const [index, setIndex] = useState(0);
  return (
    <TouchableWithoutFeedback onPress={() => setIndex((i) => i + 1)}>
      <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap" }}>
        {new Array(300).fill(0).map((_, i) => (
          <SkiaGradient key={`${index}-${i}`} width={30} height={30} />
        ))}
      </View>
    </TouchableWithoutFeedback>
  );
};
