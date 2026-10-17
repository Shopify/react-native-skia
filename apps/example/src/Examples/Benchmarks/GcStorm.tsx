import React, { useCallback, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Canvas, Path, Skia } from "react-native-skia";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Hud } from "./Hud";
import {
  diffStats,
  hermesStats,
  sleep,
  useBenchRunner,
  useJsHeartbeat,
} from "./harness";
import type { Phase } from "./harness";
import { palette } from "./palette";

// Thirty-five line charts that all get new data on every interaction, the
// screen from issue 4077: each interaction is a React commit into every
// canvas, so every canvas is recorded again on the JS thread. The phase
// counts Hermes garbage collections and the JS thread's busy time per
// interaction.

const charts = 35;
const columns = 5;
const points = 40;
const interactions = 40;
const intervalMs = 250;

const generate = (seed: number) =>
  new Array(charts).fill(0).map((_, c) => {
    let s = seed * 1013 + c * 7919 + 1;
    const random = () => {
      s = (s * 1103515245 + 12345) % 2147483648;
      return s / 2147483648;
    };
    const values: number[] = [];
    let v = 0.5;
    for (let i = 0; i < points; i++) {
      v = Math.min(1, Math.max(0, v + (random() - 0.5) * 0.3));
      values.push(v);
    }
    return values;
  });

interface ChartProps {
  values: number[];
  width: number;
  height: number;
  color: string;
}

const Chart = ({ values, width, height, color }: ChartProps) => {
  const { line, area } = useMemo(() => {
    const builder = Skia.PathBuilder.Make();
    values.forEach((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height * (0.1 + 0.8 * (1 - v));
      if (i === 0) {
        builder.moveTo(x, y);
      } else {
        builder.lineTo(x, y);
      }
    });
    const l = builder.build();
    const a = builder.lineTo(width, height).lineTo(0, height).close().build();
    return { line: l, area: a };
  }, [values, width, height]);
  return (
    <Canvas style={{ width, height }}>
      <Path path={area} color={color} opacity={0.25} />
      <Path path={line} style="stroke" strokeWidth={2} color={color} />
    </Canvas>
  );
};

export const GcStorm = () => {
  const [data, setData] = useState(() => generate(0));
  const { width } = useWindowDimensions();
  const chartWidth = Math.floor(width / columns) - 6;
  const chartHeight = 64;
  const heartbeat = useJsHeartbeat();
  const seed = useRef(1);
  const navigation = useNavigation();
  const route = useRoute<{
    key: string;
    name: string;
    params?: { auto?: boolean };
  }>();

  // Regenerates every chart's data `interactions` times, measuring how long
  // the JS thread takes to be free again after each update.
  const interact = useCallback(async () => {
    const before = hermesStats();
    heartbeat.start();
    const durations: number[] = [];
    const t0 = performance.now();
    for (let i = 0; i < interactions; i++) {
      const start = performance.now();
      setData(generate(seed.current++));
      // The timer fires once React has rendered, committed and recorded.
      await sleep(0);
      durations.push(performance.now() - start);
      const next = t0 + (i + 1) * intervalMs;
      await sleep(Math.max(0, next - performance.now()));
    }
    const hb = heartbeat.stop();
    const after = hermesStats();
    const sorted = durations.slice().sort((a, b) => a - b);
    const sum = durations.reduce((a, b) => a + b, 0);
    return {
      interactions,
      jsMeanMs: sum / durations.length,
      jsP50Ms: sorted[Math.floor(sorted.length / 2)],
      jsP95Ms:
        sorted[Math.min(sorted.length - 1, Math.floor(0.95 * sorted.length))],
      jsMaxMs: sorted[sorted.length - 1],
      jsTotalMs: sum,
      heartbeat: hb,
      gcBefore: before,
      gcAfter: after,
      gcDelta: diffStats(before, after),
    };
  }, [heartbeat]);

  const phases = useMemo<Phase[]>(
    () => [
      { name: "calibration", params: { interactions: 0 }, durationMs: 4000 },
      {
        name: "interactions",
        params: { interactions, intervalMs },
        run: interact,
      },
    ],
    [interact]
  );
  const { status, results } = useBenchRunner(
    "gc-storm",
    phases,
    () => {},
    () => {
      if (route.params?.auto && navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  );
  const gc = results.find((r) => r.name === "interactions")?.extra?.gcDelta as
    Record<string, number> | null | undefined;
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {data.map((values, i) => (
          <Chart
            key={i}
            values={values}
            width={chartWidth}
            height={chartHeight}
            color={palette[i % palette.length]}
          />
        ))}
      </View>
      {gc && (
        <Text style={styles.gc}>
          GCs: {gc.js_numGCs ?? "n/a"} · GC time:{" "}
          {Math.round((gc.js_gcTime ?? 0) * 1000)} ms
        </Text>
      )}
      <Hud title="GC storm" status={status} results={results} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  grid: {
    paddingTop: 96,
    paddingHorizontal: 3,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  gc: {
    padding: 16,
    color: "#333",
  },
});
