import React, { useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import type {
  SkPoint,
  SkGraphiteContext,
  SkiaGraphiteViewRef,
} from "@shopify/react-native-skia";
import {
  Canvas,
  Group,
  PointMode,
  Points,
  Skia,
  SkiaGraphiteView,
} from "@shopify/react-native-skia";
import { useSharedValue } from "react-native-reanimated";

const COUNTS = [250_000, 1_000_000] as const;
const BATCH_SIZE = 10_000;
const COLORS = ["#ff6b6b", "#feca57", "#48dbfb", "#1dd1a1"];

// Purely synthetic points: no external data, assets, or interaction logic.
const getPoint = (index: number, width: number, height: number): SkPoint => ({
  x: (((index * 73) % 1_000_003) / 1_000_003) * width,
  y: (((index * 179) % 1_000_033) / 1_000_033) * height,
});

const makePointBatches = (count: number, width: number, height: number) =>
  Array.from({ length: Math.ceil(count / BATCH_SIZE) }, (_, batch) =>
    Array.from(
      { length: Math.min(BATCH_SIZE, count - batch * BATCH_SIZE) },
      (_, offset) => getPoint(batch * BATCH_SIZE + offset, width, height),
    ),
  );

const hasGraphite = (() => {
  if (Platform.OS === "web") {
    return true;
  }
  try {
    return typeof Skia.getNativeDevice() === "bigint";
  } catch {
    return false;
  }
})();

type DrawingProps = {
  count: number;
  width: number;
  height: number;
};

const GaneshDrawing = ({ count, width, height }: DrawingProps) => {
  // A single static shared value keeps the declarative recording alive. No
  // animation or large worklet closure contributes to this memory experiment.
  const opacity = useSharedValue(1);
  const batches = useMemo(
    () => makePointBatches(count, width, height),
    [count, width, height],
  );

  return (
    <Canvas style={styles.canvas}>
      <Group opacity={opacity}>
        {batches.map((points, index) => (
          <Points
            key={index}
            points={points}
            mode="points"
            style="stroke"
            strokeWidth={3}
            color={COLORS[index % COLORS.length]}
          />
        ))}
      </Group>
    </Canvas>
  );
};

const drawGraphite = (context: SkGraphiteContext, batches: SkPoint[][]) => {
  const canvas = context.beginRecording();
  canvas.clear(Skia.Color("#0b1020"));
  const paints = COLORS.map((color) => {
    const paint = Skia.Paint();
    paint.setColor(Skia.Color(color));
    paint.setStrokeWidth(3);
    return paint;
  });
  batches.forEach((points, index) =>
    canvas.drawPoints(PointMode.Points, points, paints[index % paints.length]),
  );
  context.submit(context.finishRecording());
};

const GraphiteDrawing = ({ count, width, height }: DrawingProps) => {
  const ref = useRef<SkiaGraphiteViewRef>(null);
  const batches = useMemo(
    () => makePointBatches(count, width, height),
    [count, width, height],
  );
  useEffect(() => {
    const context = ref.current?.getContext();
    if (context) {
      drawGraphite(context, batches);
    }
  }, [batches]);
  return <SkiaGraphiteView ref={ref} style={styles.canvas} opaque />;
};

export const CanvasMemory = () => {
  const [mounted, setMounted] = useState(false);
  const [count, setCount] = useState<number>(COUNTS[1]);
  const [backend, setBackend] = useState<"Ganesh" | "Graphite">("Ganesh");
  const [completedCycles, setCompletedCycles] = useState(0);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const toggle = () => {
    if (mounted) {
      setCompletedCycles(completedCycles + 1);
    }
    setMounted(!mounted);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>
        Profile a Release build. Mount, then unmount the canvas without touching
        it. Wait 15 seconds at each unmounted baseline; repeat five times and
        compare the settled memory floor in Xcode.
      </Text>
      <View style={styles.controls}>
        {COUNTS.map((value) => (
          <Pressable
            key={value}
            disabled={mounted}
            onPress={() => setCount(value)}
            style={[styles.option, count === value && styles.selected]}
          >
            <Text style={styles.optionText}>
              {value.toLocaleString()} points
            </Text>
          </Pressable>
        ))}
      </View>
      {hasGraphite && (
        <View style={styles.controls}>
          {(["Ganesh", "Graphite"] as const).map((value) => (
            <Pressable
              key={value}
              disabled={mounted}
              onPress={() => setBackend(value)}
              style={[styles.option, backend === value && styles.selected]}
            >
              <Text style={styles.optionText}>{value}</Text>
            </Pressable>
          ))}
        </View>
      )}
      <Pressable onPress={toggle} style={styles.toggle}>
        <Text style={styles.toggleText}>
          {mounted ? "Unmount canvas" : "Mount canvas"}
        </Text>
      </Pressable>
      <Text style={styles.counter}>Completed cycles: {completedCycles}</Text>
      <View
        style={styles.stage}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          if (width !== size.width || height !== size.height) {
            setSize({ width, height });
          }
        }}
      >
        {mounted && size.width > 0 && size.height > 0 ? (
          backend === "Graphite" ? (
            <GraphiteDrawing count={count} {...size} />
          ) : (
            <GaneshDrawing count={count} {...size} />
          )
        ) : (
          <Text style={styles.placeholder}>Canvas unmounted</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  instructions: { color: "#222", fontSize: 14, padding: 12 },
  controls: { flexDirection: "row", paddingHorizontal: 12, paddingBottom: 8 },
  option: {
    borderColor: "#aaa",
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selected: { backgroundColor: "#cde8ff", borderColor: "#2877b8" },
  optionText: { color: "#111" },
  toggle: {
    alignItems: "center",
    backgroundColor: "#2877b8",
    borderRadius: 8,
    marginHorizontal: 12,
    padding: 12,
  },
  toggleText: { color: "#fff", fontWeight: "600" },
  counter: { color: "#444", padding: 12 },
  stage: {
    flex: 1,
    backgroundColor: "#0b1020",
    justifyContent: "center",
    alignItems: "center",
  },
  canvas: { flex: 1, alignSelf: "stretch" },
  placeholder: { color: "#fff" },
});
