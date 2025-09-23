import React, { useState, useRef, useEffect } from "react";
import { Alert, Button, ScrollView, StyleSheet } from "react-native";
import type { SkPicture } from "@shopify/react-native-skia";
import {
  Canvas,
  Image,
  Skia,
  usePictureAsTexture,
} from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";

const createPictureWithGPUResources = (
  picture?: SharedValue<SkPicture | null>
) => {
  "worklet";
  const offscreenSurface = Skia.Surface.MakeOffscreen(400, 400)!;
  const surfaceCanvas = offscreenSurface.getCanvas();
  // Create new picture with many GPU-backed elements

  // Draw many elements with GPU resources
  for (let i = 0; i < 1000; i++) {
    const paint = Skia.Paint();
    paint.setColor(
      Float32Array.from([Math.random(), Math.random(), Math.random(), 1])
    );

    const x = (i % 20) * 20;
    const y = Math.floor(i / 20) * 8;

    surfaceCanvas.drawCircle(x, y, 3, paint);
  }
  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording({
    x: 0,
    y: 0,
    width: 400,
    height: 400,
  });
  canvas.drawImage(
    offscreenSurface.makeImageSnapshot().makeNonTextureImage(),
    0,
    0
  );
  const result = recorder.finishRecordingAsPicture();
  if (picture) {
    picture.value = result;
  }
  return result;
};

export const StressTest = () => {
  const [picture, setPicture] = useState<SkPicture | null>(null);
  const texture = usePictureAsTexture(picture, {
    width: 400,
    height: 400,
  });
  // Use React state instead of shared values to trigger React re-renders

  const [, setRefreshCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<unknown>(-1);

  // Convert picture to texture using useTexture as described in crash scenario
  // This will recreate the texture on every React re-render when picture changes
  // const texture = useTexture(
  //   useMemo(() => <Picture picture={picture} />, [picture]),
  //   { width: 400, height: 400 }
  // );

  useEffect(() => {
    return () => {
      // Cleanup interval on unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current as number);
      }
    };
  }, []);

  const startStressTest = () => {
    if (isRunning) return;

    setIsRunning(true);

    // Use setInterval to rapidly update the picture, triggering React re-renders
    intervalRef.current = setInterval(() => {
      setPicture(() => createPictureWithGPUResources() ?? null);

      // This setState will trigger a React re-render, which will:
      // 1. Recreate the texture via useTexture
      // 2. Potentially cause the old picture to be GC'd on a different thread
      // 3. Create the race condition where GPU resources are destroyed on the wrong thread
      setRefreshCount((count) => {
        const newCount = count + 1;
        console.log("Picture regenerated #" + newCount + " at " + Date.now());
        return newCount;
      });
    }, 32) as unknown; // ~60fps to stress the system and trigger the race condition
  };

  const stopStressTest = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current as number);
    }
    setIsRunning(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Canvas
        style={{
          width: 400,
          height: 400,
          borderColor: "red",
          borderWidth: 2,
        }}
      >
        {/* Use Image with texture as described in crash scenario */}
        <Image image={texture} x={0} y={0} width={400} height={400} />
      </Canvas>
      <Button
        onPress={isRunning ? stopStressTest : startStressTest}
        title={
          isRunning
            ? "Stop GPU Resource Crash Test"
            : "Start GPU Resource Crash Test"
        }
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
