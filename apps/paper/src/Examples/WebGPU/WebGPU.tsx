import { BlendMode, BlurStyle, mix, polar2Canvas, Skia, SkiaContext } from "@shopify/react-native-skia";
import React from "react";
import { Dimensions, PixelRatio, StyleSheet, View } from "react-native";
import {  useFrameCallback, useSharedValue } from "react-native-reanimated";
import { Canvas, useCanvasEffect } from "react-native-wgpu";
import { useLoop } from "../../components/Animations";


const pd = PixelRatio.get();
const { width, height } = Dimensions.get("window");
const center = { x: width / 2, y: height / 2 };
const R = width / 4;

const c1 = "#61bea2";
const c2 = "#529ca0";
const root = Skia.Paint();
root.setBlendMode(BlendMode.Screen);
root.setMaskFilter(Skia.MaskFilter.MakeBlur(BlurStyle.Solid, 10, true));
const p1 = root.copy();
p1.setColor(Skia.Color(c1));
const p2 = root.copy();
p2.setColor(Skia.Color(c2));

export function WebGPU() {
  const context = useSharedValue<SkiaContext | null>(null);
  const ref = useCanvasEffect(() => {
    const nativeSurface = ref.current!.getNativeSurface();
    context.value = Skia.Context(
      nativeSurface.surface,
      nativeSurface.width * pd,
      nativeSurface.height * pd
    );
  });

  const progress = useLoop({ duration: 3000 });

  useFrameCallback(() => {
    if (!context.value) {
      console.log("skip frame");
      return;
    }
    const ctx = context.value;
    const surface = ctx.getSurface();
    const canvas = surface.getCanvas();
    canvas.clear(Skia.Color(`rgb(36,43,56)`));
    canvas.save();
    canvas.scale(pd, pd);
    canvas.rotate(progress.value * -180, center.x, center.y);
    {new Array(6).fill(0).map((_, index) => {
      canvas.save();
      const theta = (index * (2 * Math.PI)) / 6;
      const { x, y } = polar2Canvas(
        { theta, radius: progress.value * R },
        { x: 0, y: 0 }
      );
      const scale = mix(progress.value, 0.3, 1);

      canvas.translate(center.x, center.y);
      canvas.translate(x, y);
      canvas.scale(scale, scale);
      canvas.translate(-center.x, -center.y);

      const paint = index % 2 ? p1 : p2;
      canvas.drawCircle(center.x, center.y, R, paint);
      canvas.restore();
    })}
    canvas.restore();
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
