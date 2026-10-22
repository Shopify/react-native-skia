import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import {
  AlphaType,
  Canvas,
  ColorType,
  Image,
  Path,
  Skia,
  Text,
  matchFont,
} from "react-native-skia";
import { useNavigation, useRoute } from "@react-navigation/native";

import { Hud } from "./Hud";
import { sleep, useBenchRunner } from "./harness";
import type { Phase } from "./harness";
import { palette } from "./palette";

// A grid of small static canvases, the icons of a toolbar or a list: each
// draws a path, a glyph and one raster image shared by all of them, and then
// nothing changes. What each canvas costs is what it holds once drawn (the
// recorder it recorded with, that recorder's glyph atlas, its upload of the
// image) and the work of mounting it. The phases mount 25 to 200 icons, hold
// them, and unmount them; the results server reads the process memory around
// each phase (dumpsys meminfo on Android, an Instruments recording on iOS).

const counts = [25, 50, 100, 200];
const columns = 12;

// Mounting and unmounting happen inside the measurement, so that the UI
// thread's stall while the native views appear is sampled; every phase reads
// the process footprint at its end.
const phases: Phase[] = [
  { name: "calibration", params: { icons: 0 } },
  ...counts.flatMap((icons) => [
    {
      name: `mount-${icons}`,
      params: { icons, step: "mount" },
      warmupMs: 0,
      durationMs: 4000,
    },
    {
      name: `steady-${icons}`,
      params: { icons, step: "steady" },
      warmupMs: 1000,
      durationMs: 3000,
    },
    {
      name: `unmount-${icons}`,
      params: { icons: 0, step: "unmount" },
      warmupMs: 0,
      durationMs: 3000,
    },
  ]),
];

// The physical memory footprint of the process, through the probe the view
// API exposes for the benchmarks (phys_footprint on Apple platforms, the
// resident set on Android: not the same measure, so the two platforms are
// only compared with themselves).
const footprintMb = () => {
  const bytes = globalThis.SkiaViewApi.memoryFootprint?.();
  return typeof bytes === "number" && bytes > 0
    ? bytes / (1024 * 1024)
    : undefined;
};

// A 64x64 raster (CPU) image: drawing it uploads it.
const makeImage = () => {
  const width = 64;
  const height = 64;
  const pixels = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      pixels[i] = Math.round((x / (width - 1)) * 255);
      pixels[i + 1] = Math.round((y / (height - 1)) * 255);
      pixels[i + 2] = 160;
      pixels[i + 3] = 255;
    }
  }
  return Skia.Image.MakeRasterImage(
    {
      width,
      height,
      colorType: ColorType.RGBA_8888,
      alphaType: AlphaType.Unpremul,
    },
    Skia.Data.fromBytes(pixels),
    width * 4
  );
};

const makeStar = (size: number) => {
  const builder = Skia.PathBuilder.Make();
  const cx = size / 2;
  const cy = size / 2;
  const outer = size * 0.46;
  const inner = size * 0.2;
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    if (i === 0) {
      builder.moveTo(x, y);
    } else {
      builder.lineTo(x, y);
    }
  }
  builder.close();
  return builder.build();
};

interface IconProps {
  index: number;
  size: number;
  image: ReturnType<typeof makeImage>;
  star: ReturnType<typeof makeStar>;
  font: ReturnType<typeof matchFont>;
}

const Icon = ({ index, size, image, star, font }: IconProps) => {
  const letter = String.fromCharCode(65 + (index % 26));
  const { width } = font.measureText(letter);
  return (
    <Canvas style={{ width: size, height: size }}>
      <Image
        image={image}
        x={0}
        y={0}
        width={size}
        height={size}
        fit="cover"
        opacity={0.5}
      />
      <Path path={star} color={palette[index % palette.length]} />
      <Text
        x={(size - width) / 2}
        y={size * 0.66}
        text={letter}
        font={font}
        color="white"
      />
    </Canvas>
  );
};

export const IconGrid = () => {
  const [icons, setIcons] = useState(0);
  const { width } = useWindowDimensions();
  const size = Math.floor((width - 2 * (columns + 1)) / columns);
  const image = useMemo(makeImage, []);
  const star = useMemo(() => makeStar(size), [size]);
  const font = useMemo(
    () =>
      matchFont({
        fontFamily: Platform.select({
          ios: "Helvetica",
          default: "sans-serif",
        }),
        fontSize: Math.round(size * 0.5),
        fontWeight: "bold",
      }),
    [size]
  );
  // Resolved by the commit that applies the pending count.
  const pending = useRef<{ icons: number; resolve: () => void } | null>(null);
  useEffect(() => {
    if (pending.current !== null && pending.current.icons === icons) {
      pending.current.resolve();
      pending.current = null;
    }
  }, [icons]);
  const setIconsAndWait = useCallback((count: number) => {
    return new Promise<void>((resolve) => {
      pending.current = { icons: count, resolve };
      setIcons(count);
    });
  }, []);
  const navigation = useNavigation();
  const route = useRoute<{
    key: string;
    name: string;
    params?: { auto?: boolean };
  }>();
  const runPhases = useMemo(
    () =>
      phases.map((phase) => ({
        ...phase,
        run: async (durationMs: number) => {
          const t0 = performance.now();
          let commitMs: number | undefined;
          const step = phase.params?.step;
          if (step === "mount" || step === "unmount") {
            await setIconsAndWait(phase.params?.icons as number);
            commitMs = performance.now() - t0;
          }
          await sleep(Math.max(0, durationMs - (performance.now() - t0)));
          return { commitMs, footprintMb: footprintMb() };
        },
      })),
    [setIconsAndWait]
  );
  const { status, results } = useBenchRunner(
    "icon-grid",
    runPhases,
    (phase) => {
      if (phase.name === "calibration") {
        setIcons(0);
      }
    },
    () => {
      if (route.params?.auto && navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  );
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {image !== null
          ? new Array(icons)
              .fill(0)
              .map((_, i) => (
                <Icon
                  key={i}
                  index={i}
                  size={size}
                  image={image}
                  star={star}
                  font={font}
                />
              ))
          : null}
      </View>
      <Hud title="Icon grid" status={status} results={results} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1020",
  },
  grid: {
    flex: 1,
    paddingTop: 110,
    paddingHorizontal: 2,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    alignContent: "flex-start",
  },
});
