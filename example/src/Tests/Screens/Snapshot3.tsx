import React from "react";
import { PixelRatio, View } from "react-native";

const pd = PixelRatio.get();
const px = (s: number) => s / pd;

export const Snapshot3 = () => {
  return (
    <View
      style={{
        margin: px(40),
        borderRadius: px(40),
        overflow: "hidden",
      }}
    >
      <View style={{ backgroundColor: "blue", height: px(100) }} />
      <View style={{ backgroundColor: "green", height: px(200) }} />
    </View>
  );
};
