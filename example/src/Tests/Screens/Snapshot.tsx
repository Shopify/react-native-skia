import React from "react";
import { PixelRatio, View } from "react-native";

const pd = PixelRatio.get();
const px = (s: number) => s / pd;

export const Snapshot1 = () => {
  return (
    <View style={{ flex: 1, backgroundColor: "cyan", padding: 16 }}>
      <View
        style={{
          width: px(200),
          height: px(200),
          backgroundColor: "magenta",
          borderRadius: 20,
          borderWidth: 8,
          borderColor: "yellow",
        }}
      />
    </View>
  );
};
