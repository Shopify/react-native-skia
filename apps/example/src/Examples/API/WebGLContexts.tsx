import React, { useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { Canvas, Circle, Fill } from "react-native-skia";
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

// Renders far more canvases than the browser allows live WebGL contexts
// (16 in Chrome) with __destroyWebGLContextAfterRender: they hold no context
// of their own and are drawn through one shared context. Every other canvas
// is animated. On native the flag is a no-op.
const CANVAS_COUNT = 30;
const SIZE = 160;

const isWeb = Platform.OS === "web" && typeof document !== "undefined";

const background = (i: number) =>
  [(i * 53) % 256, (i * 97) % 256, 180] as const;

const Orbit = ({ index }: { index: number }) => {
  const clock = useSharedValue(0);
  useEffect(() => {
    clock.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1
    );
  }, [clock]);
  const cx = useDerivedValue(
    () =>
      SIZE / 2 + (SIZE / 3) * Math.cos((clock.value + index / 7) * Math.PI * 2)
  );
  const cy = useDerivedValue(
    () =>
      SIZE / 2 + (SIZE / 3) * Math.sin((clock.value + index / 7) * Math.PI * 2)
  );
  return <Circle cx={cx} cy={cy} r={SIZE / 10} color="#1c2541" />;
};

// Counts the canvases showing their background in the top-left corner, which
// the orbiting circle never reaches.
const countPainted = () => {
  const canvases = document.querySelectorAll<HTMLCanvasElement>(
    '[data-testid="grid"] canvas'
  );
  let painted = 0;
  canvases.forEach((canvas, i) => {
    const ctx = canvas.getContext("2d");
    if (!ctx || canvas.width === 0) {
      return;
    }
    const pixel = ctx.getImageData(2, 2, 1, 1).data;
    const expected = background(i);
    if (
      expected.every((value, channel) => Math.abs(pixel[channel] - value) <= 2)
    ) {
      painted++;
    }
  });
  return painted;
};

export const WebGLContexts = () => {
  const [painted, setPainted] = useState(0);
  useEffect(() => {
    if (!isWeb) {
      return undefined;
    }
    const interval = setInterval(() => setPainted(countPainted()), 500);
    return () => clearInterval(interval);
  }, []);
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>WebGL Canvas Stress Test</Text>
      <Text style={styles.description}>
        {CANVAS_COUNT} canvases, far more than the browser's live WebGL context
        limit, drawn through one shared context; every other canvas is animated.
        Expected: every canvas shows its color. Broken: the oldest canvases go
        blank as their contexts are evicted.
      </Text>
      <Text style={styles.status} testID="status">
        {isWeb ? `canvases: ${painted}/${CANVAS_COUNT}` : "web only"}
      </Text>
      <View style={styles.grid} testID="grid">
        {new Array(CANVAS_COUNT).fill(0).map((_, i) => (
          <View key={i} style={styles.cell}>
            <Text style={styles.label}>Canvas {i + 1}</Text>
            <Canvas
              style={styles.canvas}
              __destroyWebGLContextAfterRender
              testID={i % 2 ? "animated" : undefined}
            >
              <Fill color={`rgb(${background(i).join(", ")})`} />
              {i % 2 === 1 && <Orbit index={i} />}
            </Canvas>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 13,
    color: "#666",
  },
  status: {
    fontSize: 13,
    fontFamily: Platform.select({ web: "monospace", default: undefined }),
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  cell: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  canvas: {
    width: SIZE,
    height: SIZE,
  },
});
