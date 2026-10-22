import { Platform } from "react-native";

// Tag written into every result. The 2.x copy of this folder says "v2".
export const BENCH_VERSION = "v3";

// Where the benchmark screens post their results and phase events
// (see apps/example/benchmarks/results-server.js). Android reaches the host
// through `adb reverse tcp:4299 tcp:4299`; a device on the same network needs
// the host's address.
export const RESULTS_HOST =
  Platform.OS === "android"
    ? "http://localhost:4299"
    : "http://192.168.1.29:4299";
