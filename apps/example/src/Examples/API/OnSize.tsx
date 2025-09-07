import { Canvas, Rect, rect } from "@shopify/react-native-skia";
import React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";

export const OnSize = () => {
  const size = useSharedValue({ width: 0, height: 0 });
  const redRect = useDerivedValue(() => {
    return rect(0, 0, size.value.width, size.value.height);
  });

  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: "cyan",
      }}
    >
      <Canvas onSize={size} style={StyleSheet.absoluteFill}>
        <Rect rect={redRect} color="red" />
      </Canvas>
      <TextInput
        placeholder={`
Hello
World!
 `}
        multiline
      />
    </View>
  );
};
