import React from "react";
import {
  Alert,
  Button,
  PixelRatio,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import type { SkImage, SkSurface } from "@shopify/react-native-skia";
import { Canvas, Image, Skia } from "@shopify/react-native-skia";
import { runOnUI, useSharedValue, withTiming } from "react-native-reanimated";

export default function App() {
  const image = useSharedValue<SkImage | null>(null);
  const surface = useSharedValue<SkSurface | null>(null);
  const looper = useSharedValue(0);
  const pixelRatio = PixelRatio.get();

  const start = () => {
    "worklet";
    surface.value = Skia.Surface.MakeOffscreen(
      pixelRatio * 200,
      pixelRatio * 200
    );
    const blink = () => {
      if (!surface.value) {
        Alert.alert("surface is null");
        return;
      }
      const canvas = surface.value.getCanvas();
      const paint = Skia.Paint();
      paint.setColor(
        Float32Array.from([Math.random(), Math.random(), Math.random(), 1])
      );
      canvas.drawRect(
        {
          x: 0,
          y: 0,
          width: pixelRatio * 200,
          height: pixelRatio * 200,
        },
        paint
      );
      surface.value.flush();
      image.value = surface.value.makeImageSnapshot();
      looper.value = withTiming(1 - looper.value, { duration: 10 }, blink);
    };
    blink();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Canvas
        style={{
          width: 200,
          height: 200,
          borderColor: "red",
          borderWidth: 1,
        }}
      >
        <Image image={image} width={200} height={200} />
      </Canvas>
      <Button onPress={runOnUI(start)} title="Start" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ecf0f1",
    padding: 8,
  },
});
