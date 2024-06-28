import React from "react";
import { Canvas, useImage, Image } from "@shopify/react-native-skia";
import { View } from "react-native";
import { Image as EXImage } from "expo-image";

export const TestScreen = () => {
  const image = useImage(require("./2024.png"));
  if (image === null) {
    return null;
  }
  return (
    <View style={{ flex: 1 }}>
      <Canvas style={{ flex: 1 }}>
        <Image image={image} x={0} y={0} width={256} height={256} fit="cover" />
      </Canvas>
      <View style={{ flex: 1 }}>
        <EXImage
          source={require("./2024.png")}
          style={{ width: 256, height: 256 }}
        />
      </View>
    </View>
  );
};

export default TestScreen;
