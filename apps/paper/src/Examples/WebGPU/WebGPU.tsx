import { Skia } from "@shopify/react-native-skia";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Canvas, useCanvasEffect } from "react-native-wgpu";

export function WebGPU() {
  const ref = useCanvasEffect(() => {
    const nativeSurface = ref.current!.getNativeSurface();
    const ctx = Skia.Context(
      nativeSurface.surface,
      nativeSurface.width,
      nativeSurface.height
    );
    const surface = ctx.getSurface();
    const canvas = surface.getCanvas();
    canvas.drawColor(Skia.Color("cyan"));
    ctx.present();
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
