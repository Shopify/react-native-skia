import { Skia } from "@shopify/react-native-skia";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Canvas, useCanvasEffect } from "react-native-wgpu";

export function WebGPU() {
  const ref = useCanvasEffect(() => {
    const nativeSurface = ref.current!.getNativeSurface();
    const surface = Skia.Surface.MakeFromNativeSurface(
      nativeSurface.surface,
      nativeSurface.width,
      nativeSurface.height
    );
    console.log({ surface });
  });

  return (
    <View style={style.container}>
      <Canvas ref={ref} style={style.webgpu} />
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
