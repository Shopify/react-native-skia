import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { useFrameCallback, useSharedValue } from "react-native-reanimated";
import { scheduleOnRN, scheduleOnUI } from "react-native-worklets";

import { BENCH_VERSION, RESULTS_HOST } from "./config";

export interface IntervalStats {
  frames: number;
  durationMs: number;
  fps: number;
  meanMs: number;
  p50Ms: number;
  p95Ms: number;
  maxMs: number;
  // The interval a frame is compared against: the calibration phase's median.
  expectedMs: number;
  // Frames whose interval exceeded 1.5x / 2.5x the expected interval.
  late: number;
  veryLate: number;
}

export const summarize = (
  intervals: number[],
  durationMs: number,
  expected: number
): IntervalStats => {
  "worklet";
  const sorted = intervals.slice().sort((a, b) => a - b);
  const n = sorted.length;
  const pick = (q: number) =>
    n === 0 ? 0 : sorted[Math.min(n - 1, Math.floor(q * n))];
  const p50 = pick(0.5);
  const expectedMs = expected > 0 ? expected : p50;
  let sum = 0;
  let late = 0;
  let veryLate = 0;
  let max = 0;
  for (let i = 0; i < n; i++) {
    const v = sorted[i];
    sum += v;
    if (v > max) {
      max = v;
    }
    if (v > 1.5 * expectedMs) {
      late++;
    }
    if (v > 2.5 * expectedMs) {
      veryLate++;
    }
  }
  return {
    frames: n,
    durationMs,
    fps: durationMs > 0 ? (n * 1000) / durationMs : 0,
    meanMs: n > 0 ? sum / n : 0,
    p50Ms: p50,
    p95Ms: pick(0.95),
    maxMs: max,
    expectedMs,
    late,
    veryLate,
  };
};

export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// Samples the interval between frames on the UI thread (Reanimated's frame
// callback) and on the JS thread (requestAnimationFrame) while recording.
export const useFrameSampler = () => {
  const uiSamples = useSharedValue<number[]>([]);
  const recording = useSharedValue(false);
  useFrameCallback((frame) => {
    "worklet";
    if (recording.value && frame.timeSincePreviousFrame !== null) {
      uiSamples.value.push(frame.timeSincePreviousFrame);
    }
  });
  const js = useRef({ samples: [] as number[], last: -1, running: false });
  const start = useCallback(() => {
    js.current = { samples: [], last: -1, running: true };
    const loop = (t: number) => {
      const s = js.current;
      if (!s.running) {
        return;
      }
      if (s.last >= 0) {
        s.samples.push(t - s.last);
      }
      s.last = t;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    scheduleOnUI(() => {
      "worklet";
      uiSamples.value = [];
      recording.value = true;
    });
  }, [recording, uiSamples]);
  const stop = useCallback(
    (durationMs: number, expectedMs: number) =>
      new Promise<{ ui: IntervalStats; js: IntervalStats }>((resolve) => {
        js.current.running = false;
        const jsStats = summarize(js.current.samples, durationMs, expectedMs);
        const done = (ui: IntervalStats) => resolve({ ui, js: jsStats });
        scheduleOnUI(() => {
          "worklet";
          recording.value = false;
          const ui = summarize(uiSamples.value, durationMs, expectedMs);
          uiSamples.value = [];
          scheduleOnRN(done, ui);
        });
      }),
    [recording, uiSamples]
  );
  return { start, stop };
};

// A shared value that follows the frame clock, in milliseconds.
export const useBenchClock = () => {
  const clock = useSharedValue(0);
  useFrameCallback((frame) => {
    "worklet";
    clock.value = frame.timeSinceFirstFrame;
  });
  return clock;
};

// Measures how long the JS thread stays busy: a timer chain whose gaps grow
// whenever a task (a React render and commit, a recording) occupies the
// thread.
export const useJsHeartbeat = () => {
  const state = useRef({ gaps: [] as number[], last: -1, running: false });
  const start = useCallback(() => {
    state.current = { gaps: [], last: performance.now(), running: true };
    const tick = () => {
      const s = state.current;
      if (!s.running) {
        return;
      }
      const now = performance.now();
      s.gaps.push(now - s.last);
      s.last = now;
      setTimeout(tick, 1);
    };
    setTimeout(tick, 1);
  }, []);
  const stop = useCallback(() => {
    state.current.running = false;
    const { gaps } = state.current;
    const sorted = gaps.slice().sort((a, b) => a - b);
    const p50 = sorted.length > 0 ? sorted[Math.floor(sorted.length / 2)] : 0;
    let busyMs = 0;
    let stalls = 0;
    let max = 0;
    for (const g of gaps) {
      if (g > 4) {
        busyMs += g - p50;
      }
      if (g > 16) {
        stalls++;
      }
      if (g > max) {
        max = g;
      }
    }
    return { ticks: gaps.length, p50Ms: p50, busyMs, stalls, maxGapMs: max };
  }, []);
  return { start, stop };
};

const post = async (path: string, body: unknown) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${RESULTS_HOST}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return await res.text();
  } catch (e) {
    return `unreachable: ${(e as Error).message}`;
  } finally {
    clearTimeout(timer);
  }
};

export const deviceInfo = () => ({
  os: Platform.OS,
  osVersion: Platform.Version,
  constants: Platform.constants,
});

export interface Phase {
  name: string;
  params?: Record<string, unknown>;
  // Time between applying the phase and the start of the measurement.
  warmupMs?: number;
  durationMs?: number;
  // Work to run during the measurement instead of waiting; its result is
  // stored with the phase.
  run?: (durationMs: number) => Promise<Record<string, unknown>>;
}

export interface PhaseResult {
  name: string;
  params: Record<string, unknown>;
  ui: IntervalStats;
  js: IntervalStats;
  extra?: Record<string, unknown>;
}

export const postEvent = (bench: string, phase: Phase, action: string) =>
  post("/event", {
    bench,
    version: BENCH_VERSION,
    platform: Platform.OS,
    phase: phase.name,
    params: phase.params ?? {},
    action,
  });

export const postResult = (bench: string, data: Record<string, unknown>) =>
  post("/result", {
    bench,
    version: BENCH_VERSION,
    platform: Platform.OS,
    device: deviceInfo(),
    ...data,
  });

// Runs the phases of a benchmark one after the other: applies the phase,
// waits for it to settle, samples the frame intervals for its duration, and
// posts every phase's statistics at the end. The first phase named
// "calibration" sets the frame interval the later phases are judged by.
export const useBenchRunner = (
  bench: string,
  phases: Phase[],
  apply: (phase: Phase) => void,
  onDone?: (results: PhaseResult[]) => void
) => {
  const [status, setStatus] = useState("starting");
  const [results, setResults] = useState<PhaseResult[]>([]);
  const sampler = useFrameSampler();
  const started = useRef(false);
  const applyRef = useRef(apply);
  applyRef.current = apply;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  useEffect(() => {
    if (started.current) {
      return;
    }
    started.current = true;
    let cancelled = false;
    (async () => {
      const out: PhaseResult[] = [];
      let expectedMs = 0;
      await sleep(1500);
      for (const phase of phases) {
        if (cancelled) {
          return;
        }
        applyRef.current(phase);
        setStatus(`${phase.name}: warming up`);
        await sleep(phase.warmupMs ?? 2000);
        await postEvent(bench, phase, "start");
        setStatus(`${phase.name}: measuring`);
        const durationMs = phase.durationMs ?? 8000;
        sampler.start();
        const t0 = performance.now();
        let extra: Record<string, unknown> | undefined;
        if (phase.run) {
          extra = await phase.run(durationMs);
        } else {
          await sleep(durationMs);
        }
        const elapsed = performance.now() - t0;
        const { ui, js } = await sampler.stop(elapsed, expectedMs);
        await postEvent(bench, phase, "end");
        if (phase.name === "calibration") {
          expectedMs = ui.p50Ms;
        }
        out.push({
          name: phase.name,
          params: phase.params ?? {},
          ui,
          js,
          extra,
        });
        setResults([...out]);
      }
      setStatus("posting");
      const reply = await postResult(bench, { phases: out });
      setStatus(`done (${reply.trim()})`);
      onDoneRef.current?.(out);
    })();
    return () => {
      cancelled = true;
    };
    // The runner starts once, with the phases it was mounted with.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { status, results };
};

// Hermes exposes its GC counters through HermesInternal; absent elsewhere.
export const hermesStats = (): Record<string, number> | null => {
  const hermes = (globalThis as unknown as { HermesInternal?: unknown })
    .HermesInternal as
    { getInstrumentedStats?: () => Record<string, number> } | undefined;
  if (!hermes?.getInstrumentedStats) {
    return null;
  }
  return hermes.getInstrumentedStats();
};

export const diffStats = (
  before: Record<string, number> | null,
  after: Record<string, number> | null
) => {
  if (!before || !after) {
    return null;
  }
  const out: Record<string, number> = {};
  for (const key of Object.keys(after)) {
    if (typeof after[key] === "number" && typeof before[key] === "number") {
      out[key] = after[key] - before[key];
    }
  }
  return out;
};
