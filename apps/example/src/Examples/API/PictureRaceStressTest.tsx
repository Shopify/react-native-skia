import React, { useEffect, useRef, useState } from "react";
import { Button, ScrollView, StyleSheet, Text, View } from "react-native";
import type { SkImage, SkPicture } from "@shopify/react-native-skia";
import {
  createPicture,
  FilterMode,
  MipmapMode,
  Skia,
  SkiaPictureView,
  TileMode,
} from "@shopify/react-native-skia";
import { SkiaViewApi } from "@shopify/react-native-skia/src/views/api";

/**
 * Stress test for https://github.com/Shopify/react-native-skia/issues/3925
 *
 * RNSkPictureRenderer::_picture is written from the JS thread (setPicture,
 * via setJsiProperty) and read from the main thread (performDraw) without
 * synchronization. The sk_sp copy in performDraw reads the raw pointer and
 * then increments the refcount in two separate steps, so if the JS thread
 * swaps the picture in between — and the renderer held the last reference —
 * the main thread refs/draws a destroyed SkPicture:
 *
 *   - EXC_BREAKPOINT (SIGTRAP) in SkRefCntBase::ref() / SkSafeRef<SkPicture>
 *   - EXC_BAD_ACCESS (SIGSEGV) in SkCanvas::drawPicture
 *
 * To make the renderer the sole owner at swap time (in real apps this is
 * done by the Hermes GC finalizing the previous frame's JsiSkPicture), the
 * test dispose()s the previous picture right before setting the new one.
 * It then swaps pictures on several views as fast as the JS thread allows,
 * while every swap also schedules a main-thread redraw — maximizing the
 * number of swap-vs-copy encounters.
 *
 * Running the app with Thread Sanitizer enabled flags the race on the very
 * first concurrent swap, without needing an actual crash.
 */

const NUM_VIEWS = 6;
const SWAPS_PER_TICK = 10;
const SIZE = 96;

// A shared GPU-backed image referenced by every picture (matches the
// reporter's setup: one decoded image used as a shader by every frame).
const makeSharedImage = (): SkImage | null => {
  const surface = Skia.Surface.MakeOffscreen(64, 64);
  if (!surface) {
    return null;
  }
  const canvas = surface.getCanvas();
  const paint = Skia.Paint();
  paint.setShader(
    Skia.Shader.MakeLinearGradient(
      { x: 0, y: 0 },
      { x: 64, y: 64 },
      [Skia.Color("cyan"), Skia.Color("magenta")],
      null,
      TileMode.Clamp
    )
  );
  canvas.drawRect(Skia.XYWHRect(0, 0, 64, 64), paint);
  surface.flush();
  return surface.makeImageSnapshot();
};

const buildPicture = (image: SkImage | null, seed: number) =>
  createPicture(
    (canvas) => {
      const paint = Skia.Paint();
      if (image) {
        paint.setShader(
          image.makeShaderOptions(
            TileMode.Repeat,
            TileMode.Repeat,
            FilterMode.Linear,
            MipmapMode.None
          )
        );
      } else {
        paint.setColor(Skia.Color("magenta"));
      }
      for (let i = 0; i < 20; i++) {
        const x = (seed * 13 + i * 37) % SIZE;
        const y = (seed * 7 + i * 53) % SIZE;
        canvas.drawCircle(x, y, 8 + (i % 12), paint);
      }
    },
    { width: SIZE, height: SIZE }
  );

export const PictureRaceStressTest = () => {
  const [running, setRunning] = useState(false);
  const [displayedSwaps, setDisplayedSwaps] = useState(0);
  const viewRefs = useRef<(SkiaPictureView | null)[]>([]);
  const swapCount = useRef(0);

  useEffect(() => {
    if (!running) {
      return;
    }
    const image = makeSharedImage();
    const previous: (SkPicture | null)[] = new Array(NUM_VIEWS).fill(null);
    let alive = true;
    let seed = 0;

    const tick = () => {
      if (!alive) {
        return;
      }
      for (let v = 0; v < NUM_VIEWS; v++) {
        const view = viewRefs.current[v];
        if (!view) {
          continue;
        }
        for (let k = 0; k < SWAPS_PER_TICK; k++) {
          const picture = buildPicture(image, seed++);
          // Drop the JS-side reference to the picture the renderer currently
          // holds, so the swap below performs the destroying unref on the JS
          // thread — racing the sk_sp copy in performDraw on the main thread.
          previous[v]?.dispose();
          SkiaViewApi.setJsiProperty(view.nativeId, "picture", picture);
          previous[v] = picture;
          swapCount.current++;
        }
      }
      setImmediate(tick);
    };
    tick();

    const display = setInterval(
      () => setDisplayedSwaps(swapCount.current),
      500
    );

    return () => {
      alive = false;
      clearInterval(display);
    };
  }, [running]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>Picture Swap Race (issue #3925)</Text>
        <Text style={styles.description}>
          Replaces the picture of {NUM_VIEWS} picture views as fast as possible
          from the JS thread while the main thread redraws them, disposing the
          previous picture before each swap. A crash (SIGTRAP in
          SkRefCntBase::ref or SIGSEGV in SkCanvas::drawPicture) means the
          unsynchronized picture swap in RNSkPictureRenderer was hit.
        </Text>
        <Text style={styles.iterations}>Swaps: {displayedSwaps}</Text>
        {running && (
          <Text style={styles.warning}>
            Running... leave it on — the window is small, this can take a while.
            Thread Sanitizer catches it immediately.
          </Text>
        )}
      </View>
      <View style={styles.canvasContainer}>
        {Array.from({ length: NUM_VIEWS }).map((_, index) => (
          <SkiaPictureView
            key={index}
            ref={(ref) => {
              viewRefs.current[index] = ref;
            }}
            style={styles.smallCanvas}
          />
        ))}
      </View>
      <View style={styles.buttonContainer}>
        <Button
          onPress={() => setRunning((r) => !r)}
          title={running ? "Stop Test" : "Start Picture Swap Test"}
          color={running ? "#dc3545" : "#28a745"}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  iterations: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  warning: {
    fontSize: 14,
    color: "#dc3545",
    fontWeight: "600",
  },
  canvasContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: 8,
  },
  smallCanvas: {
    width: SIZE,
    height: SIZE,
    margin: 4,
    borderColor: "red",
    borderWidth: 1,
  },
  buttonContainer: {
    padding: 16,
  },
});
