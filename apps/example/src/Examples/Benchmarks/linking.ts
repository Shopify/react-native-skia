import type { Routes } from "./Routes";

// URL path (under /benchmarks) for each screen of the Benchmarks stack.
export const benchmarkScreenPaths: Record<keyof Routes, string> = {
  List: "",
  HeavyCanvas: "heavy-canvas",
  ManyCanvases: "many-canvases",
  AndroidBacking: "android-backing",
  SmallIcon: "small-icon",
  GcStorm: "gc-storm",
  IconGrid: "icon-grid",
};
