import React, { useEffect, useState } from "react";
import {
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  AlphaType,
  Canvas,
  ColorType,
  Fill,
  Skia,
  useCanvasRef,
} from "react-native-skia";
import type { SkImage } from "react-native-skia";

// Skia.Surface.MakeOffscreen() on web creates an OffscreenCanvas, a WebGL
// context and a GrDirectContext on every call, and disposing the surface
// deletes the surface only: the context stays registered with CanvasKit.
// Browsers cap the number of live WebGL contexts (16 in Chrome) and evict the
// oldest one past that, visible canvases and offscreen surfaces alike.
// "Run" makes ITERATIONS short-lived offscreen surfaces, each disposed right
// away, then checks what was alive before them: the reference canvas, a
// surface the app keeps, and a snapshot taken from that surface.
// CanvasKit reads an image back through whichever WebGL context is current,
// and every surface or canvas that draws makes its own context current: each
// snapshot is read back right after the other context drew. Web only.

const ITERATIONS = 30;
const SIZE = 200;
const RED = "255,0,0,255";
const TEAL = "91,192,190,255";

const isWeb = Platform.OS === "web" && typeof document !== "undefined";

const referenceCanvas = () =>
  isWeb
    ? document.querySelector<HTMLCanvasElement>(
        '[data-testid="reference"] canvas'
      )
    : null;

const topLeftPixel = (image: SkImage) => {
  const pixels = image.readPixels(0, 0, {
    width: 1,
    height: 1,
    colorType: ColorType.RGBA_8888,
    alphaType: AlphaType.Unpremul,
  });
  return pixels ? Array.from(pixels).join(",") : "null";
};

const verdict = (pixel: string, expected: string) =>
  pixel === expected ? "ok" : `BROKEN (read ${pixel}, expected ${expected})`;

export const WebOffscreen = () => {
  const [contextState, setContextState] = useState("unknown");
  const [report, setReport] = useState("not run");
  const [error, setError] = useState<string | null>(null);
  const reference = useCanvasRef();

  // A lost context is what an evicted canvas looks like from the outside.
  useEffect(() => {
    if (!isWeb) {
      return undefined;
    }
    const tick = () => {
      const gl = referenceCanvas()?.getContext("webgl2");
      if (!gl) {
        setContextState("none");
      } else {
        setContextState(gl.isContextLost() ? "LOST" : "ok");
      }
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, []);

  const run = () => {
    setError(null);
    setReport("running");
    try {
      // A surface the app keeps (a layer it paints into over time, say) and
      // a snapshot taken from it.
      const kept = Skia.Surface.MakeOffscreen(64, 64)!;
      kept.getCanvas().drawColor(Skia.Color("red"));
      kept.flush();
      const keptSnapshot = kept.makeImageSnapshot();

      const start = performance.now();
      for (let i = 0; i < ITERATIONS; i++) {
        const surface = Skia.Surface.MakeOffscreen(256, 256)!;
        surface.getCanvas().drawColor(Skia.Color(`hsl(${i * 12}, 70%, 50%)`));
        surface.flush();
        const snapshot = surface.makeImageSnapshot();
        snapshot.dispose();
        surface.dispose();
      }
      const elapsed = performance.now() - start;

      // Chrome evicts on a timer once the limit is exceeded.
      setTimeout(() => {
        try {
          // Snapshotting the reference canvas paints it.
          const referenceSnapshot = reference.current?.makeImageSnapshot();
          kept.getCanvas().drawColor(Skia.Color("red"));
          kept.flush();
          const redrawn = kept.makeImageSnapshot();
          const referencePixel = referenceSnapshot
            ? topLeftPixel(referenceSnapshot)
            : "null";
          referenceSnapshot?.dispose();
          reference.current?.makeImageSnapshot()?.dispose();
          const keptPixel = topLeftPixel(redrawn);
          redrawn.dispose();
          const snapshotPixel = topLeftPixel(keptSnapshot);
          setReport(
            `${ITERATIONS} surfaces in ${Math.round(elapsed)} ms` +
              ` · kept surface: ${verdict(keptPixel, RED)}` +
              ` · snapshot: ${verdict(snapshotPixel, RED)}` +
              ` · reference snapshot: ${verdict(referencePixel, TEAL)}`
          );
        } catch (e) {
          setError((e as Error).message);
        }
      }, 500);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Offscreen surfaces</Text>
      <Text style={styles.description}>
        Run makes {ITERATIONS} offscreen surfaces (MakeOffscreen, draw,
        makeImageSnapshot, dispose). Expected: the reference canvas keeps
        painting, the surface kept from before the run and its snapshot still
        read back red, and a snapshot of the reference canvas reads back teal.
        Chrome logs "Too many active WebGL contexts" for every context it
        evicts. Web only.
      </Text>
      <Text style={styles.status} testID="status">
        {`reference: ${contextState} · ${report}` +
          (error ? ` · error: ${error}` : "")}
      </Text>
      <View testID="reference">
        <Canvas ref={reference} style={styles.canvas}>
          <Fill color="#5bc0be" />
        </Canvas>
      </View>
      <View style={styles.actions}>
        <Button
          testID="run"
          title={`Make ${ITERATIONS} offscreen surfaces`}
          onPress={run}
        />
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
  actions: {
    gap: 8,
    alignItems: "flex-start",
  },
  canvas: {
    width: SIZE,
    height: SIZE,
  },
});
