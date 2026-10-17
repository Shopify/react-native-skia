import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { BENCH_VERSION } from "./config";
import type { PhaseResult } from "./harness";

interface HudProps {
  title: string;
  status: string;
  results: PhaseResult[];
}

const fmt = (n: number) => (Math.round(n * 10) / 10).toString();

// Progress and the statistics of the phases measured so far, over the scene.
export const Hud = ({ title, status, results }: HudProps) => (
  <View style={styles.container} pointerEvents="none">
    <Text style={styles.title}>
      {title} · {BENCH_VERSION} · {status}
    </Text>
    {results.map((r) => (
      <Text key={r.name} style={styles.row}>
        {r.name}: UI {fmt(r.ui.fps)} fps, p95 {fmt(r.ui.p95Ms)} ms, late{" "}
        {r.ui.late} · JS {fmt(r.js.fps)} fps
        {r.extra?.jsMeanMs !== undefined
          ? ` · ${fmt(r.extra.jsMeanMs as number)} ms/interaction`
          : ""}
      </Text>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  title: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  row: {
    color: "#ddd",
    fontSize: 11,
    fontVariant: ["tabular-nums"],
  },
});
