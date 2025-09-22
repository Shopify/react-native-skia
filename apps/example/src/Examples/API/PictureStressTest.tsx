import React from "react";
import {
  Alert,
  Button,
  PixelRatio,
  ScrollView,
  StyleSheet,
} from "react-native";
import type { SkPicture } from "@shopify/react-native-skia";
import { Canvas, Picture, Skia } from "@shopify/react-native-skia";
import { runOnUI, useSharedValue, withTiming } from "react-native-reanimated";

export const PictureStressTest = () => {
  const picture = useSharedValue<SkPicture | null>(null);
  const looper = useSharedValue(0);
  const pixelRatio = PixelRatio.get();

  const start = () => {
    "worklet";

    const blink = () => {
      // Create a surface with GPU-backed content
      const surface = Skia.Surface.MakeOffscreen(
        pixelRatio * 100,
        pixelRatio * 100
      );
      if (!surface) {
        Alert.alert("surface is null");
        return;
      }

      const canvas = surface.getCanvas();
      const paint = Skia.Paint();
      paint.setColor(
        Float32Array.from([Math.random(), Math.random(), Math.random(), 1])
      );
      canvas.drawRect(
        {
          x: 0,
          y: 0,
          width: pixelRatio * 100,
          height: pixelRatio * 100,
        },
        paint
      );
      surface.flush();

      // Create GPU-backed image
      const gpuImage = surface.makeImageSnapshot();

      // Now record this GPU image into a picture
      const recorder = Skia.PictureRecorder();
      const pictureCanvas = recorder.beginRecording({
        x: 0,
        y: 0,
        width: pixelRatio * 200,
        height: pixelRatio * 200,
      });

      // Draw the GPU-backed image into the picture
      pictureCanvas.drawImage(gpuImage, 0, 0);

      // This picture now contains references to GPU resources
      picture.value = recorder.finishRecordingAsPicture();

      looper.value = withTiming(1 - looper.value, { duration: 10 }, blink);
    };
    blink();
  };

  return (
    <ScrollView style={styles.container}>
      <Canvas
        style={{
          width: 200,
          height: 200,
          borderColor: "blue",
          borderWidth: 1,
        }}
      >
        <Picture picture={picture} />
      </Canvas>
      <Button onPress={runOnUI(start)} title="Start Picture Stress Test" />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});