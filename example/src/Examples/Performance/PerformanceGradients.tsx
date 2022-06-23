import {
  Canvas,
  LinearGradient,
  Rect,
  Skia,
  SkiaView,
  TileMode,
  useDrawCallback,
  vec,
} from "@shopify/react-native-skia";
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

export const SkiaGradientImp = ({
  width,
  height,
}: {
  width: number;
  height: number;
}) => {
  const onDraw = useDrawCallback((canvas) => {
    // Cyan Circle
    const paint = Skia.Paint();
    paint.setShader(
      Skia.Shader.MakeLinearGradient(
        Skia.Point(0, 0),
        Skia.Point(width, height),
        ["red", "cyan", "lime"].map((color) => Skia.Color(color)),
        null,
        TileMode.Clamp
      )
    );
    canvas.drawRect(Skia.XYWHRect(0, 0, width, height), paint);
  });
  return <SkiaView style={{ width, height }} onDraw={onDraw} />;
};

export const PerformanceGradients = () => {
  const [index, setIndex] = useState(0);
  return (
    <TouchableWithoutFeedback onPress={() => setIndex((i) => i + 1)}>
      <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap" }}>
        {new Array(150).fill(0).map((_, i) => (
          <SkiaGradient key={`${index}-${i}`} width={30} height={30} />
        ))}
      </View>
    </TouchableWithoutFeedback>
  );
};
