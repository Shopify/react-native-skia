import React from "react";
import { StyleSheet, View } from "react-native";
import { useFrameCallback } from "react-native-reanimated";
// import { Canvas } from "react-native-wgpu";

import { useLoop } from "../../components/Animations";

import { drawBreatheDemo, useSkiaContext } from "./utils";

export function WebGPU() {
  const { ref, context } = useSkiaContext();

  const progress = useLoop({ duration: 3000 });

  useFrameCallback(() => {
    if (!context.value) {
      return;
    }

    const ctx = context.value;
    drawBreatheDemo(ctx, progress.value);
    ctx.present();
  });

  return (
    <View style={style.container}>
      {/* <Canvas ref={ref} style={style.webgpu} /> */}
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
  webgpu: {
    flex: 1,
  },
});
