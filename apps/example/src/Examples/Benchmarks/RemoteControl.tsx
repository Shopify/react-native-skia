import { useEffect } from "react";
import type { NavigationAction } from "@react-navigation/native";
import { CommonActions } from "@react-navigation/native";

import { RESULTS_HOST } from "./config";

const benchmarkRoutes = new Set([
  "HeavyCanvas",
  "ManyCanvases",
  "AndroidBacking",
  "SmallIcon",
  "GcStorm",
]);

// The part of a navigation container ref the control needs.
interface Props {
  navigationRef: {
    isReady: () => boolean;
    getCurrentRoute: () => { name: string } | undefined;
    dispatch: (action: NavigationAction) => void;
  };
}

// Lets the results server drive the app: every two seconds, while no
// benchmark is running, the app asks for the next queued benchmark and opens
// it with `auto`, which sends it back to the list once it is done.
export const BenchmarkRemoteControl = ({ navigationRef }: Props) => {
  useEffect(() => {
    let cancelled = false;
    // A benchmark that was just opened is not the current route until the
    // navigation settles, so polling pauses after each one.
    let busyUntil = 0;
    const poll = async () => {
      if (!navigationRef.isReady() || Date.now() < busyUntil) {
        return;
      }
      const current = navigationRef.getCurrentRoute()?.name;
      if (current !== undefined && benchmarkRoutes.has(current)) {
        return;
      }
      try {
        const res = await fetch(`${RESULTS_HOST}/next`);
        const { route } = (await res.json()) as { route: string | null };
        if (!cancelled && route) {
          busyUntil = Date.now() + 15000;
          navigationRef.dispatch(
            CommonActions.navigate("Benchmarks", {
              screen: route,
              initial: false,
              params: { auto: true },
            })
          );
        }
      } catch {
        // The server is optional: without it the benchmarks run by hand.
      }
    };
    const timer = setInterval(poll, 2000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [navigationRef]);
  return null;
};
