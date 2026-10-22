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
  "IconGrid",
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
// it with `auto`, which sends it back to the list once it is done. The server
// is optional (without it the benchmarks run by hand), so a request that
// gets no answer is abandoned after a second, one request is in flight at a
// time, and an unreachable host is asked again half a minute later rather
// than every two seconds: an e2e session has no server to reach.
export const BenchmarkRemoteControl = ({ navigationRef }: Props) => {
  useEffect(() => {
    let cancelled = false;
    let inFlight = false;
    // A benchmark that was just opened is not the current route until the
    // navigation settles, so polling pauses after each one.
    let busyUntil = 0;
    const poll = async () => {
      if (inFlight || !navigationRef.isReady() || Date.now() < busyUntil) {
        return;
      }
      const current = navigationRef.getCurrentRoute()?.name;
      if (current !== undefined && benchmarkRoutes.has(current)) {
        return;
      }
      inFlight = true;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1000);
      try {
        const res = await fetch(`${RESULTS_HOST}/next`, {
          signal: controller.signal,
        });
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
        busyUntil = Date.now() + 30000;
      } finally {
        clearTimeout(timeout);
        inFlight = false;
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
