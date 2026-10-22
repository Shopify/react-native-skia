import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { HomeScreenButton } from "../../Home/HomeScreenButton";

import { BENCH_VERSION, RESULTS_HOST } from "./config";
import type { Routes } from "./Routes";

export const benchmarks: {
  route: keyof Routes;
  title: string;
  description: string;
}[] = [
  {
    route: "HeavyCanvas",
    title: "1. Heavy canvas",
    description: "Thousands of rects next to a React Native animation",
  },
  {
    route: "ManyCanvases",
    title: "2. Many canvases",
    description: "Up to 200 sparkline canvases animating at once",
  },
  {
    route: "AndroidBacking",
    title: "3. Android backing views",
    description: "TextureView, SurfaceView and a scroll view of cards",
  },
  {
    route: "SmallIcon",
    title: "4. Small icon",
    description: "A spinner canvas in an ordinary screen",
  },
  {
    route: "GcStorm",
    title: "5. GC storm",
    description: "35 charts re-rendered on every interaction",
  },
  {
    route: "IconGrid",
    title: "6. Icon grid",
    description: "25 to 200 static icon canvases mounted, held and unmounted",
  },
];

export const List = () => (
  <ScrollView>
    <View style={styles.header}>
      <Text style={styles.headerText}>
        Each benchmark runs its phases on its own and posts the results to{" "}
        {RESULTS_HOST} ({BENCH_VERSION}), which can also queue benchmarks to run
        (see apps/example/benchmarks).
      </Text>
    </View>
    {benchmarks.map((b) => (
      <HomeScreenButton
        key={b.route}
        title={b.title}
        description={b.description}
        route={b.route}
      />
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: "#f2f2f7",
  },
  headerText: {
    color: "#555",
    fontSize: 12,
  },
});
