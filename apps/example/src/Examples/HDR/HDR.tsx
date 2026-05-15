import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Canvas,
  Fill,
  Shader,
  Skia,
  vec,
} from "@shopify/react-native-skia";

// A deliberately stressful scene:
// 1. A near-black vertical gradient (0 -> 15/255). 8-bit quantization
//    produces visible banding. 10-bit / F16 stays smooth.
// 2. A bright "sun" emitting linear values up to 3.0. With rgba16f +
//    EDR enabled, this glows brighter than SDR white on HDR displays.
// 3. A saturated red disc using pure P3 primaries that fall outside
//    the sRGB gamut.
const source = Skia.RuntimeEffect.Make(`
uniform float2 resolution;

half4 main(float2 fragCoord) {
  float2 uv = fragCoord / resolution;

  // Dark gradient, top -> bottom, only 16 distinct 8-bit levels.
  float v = uv.y * (15.0 / 255.0);
  half3 color = half3(v);

  // HDR highlight: white at 3.0 in extended linear P3.
  float2 sunCenter = float2(resolution.x * 0.5, resolution.y * 0.30);
  float sunDist = length(fragCoord - sunCenter);
  float sun = smoothstep(60.0, 20.0, sunDist);
  color += half3(3.0) * half(sun);

  // Wide-gamut red splash. RGB(1, 0, 0) in a P3 surface is more
  // saturated than the same in sRGB.
  float2 redCenter = float2(resolution.x * 0.5, resolution.y * 0.75);
  float redDist = length(fragCoord - redCenter);
  float red = smoothstep(80.0, 50.0, redDist);
  color = mix(color, half3(1.0, 0.0, 0.0), half(red));

  return half4(color, 1.0);
}
`)!;

type Format = "bgra8" | "bgra10" | "rgba16f";
type CS = "srgb" | "p3";

interface PanelProps {
  format: Format;
  colorSpace: CS;
  label: string;
  description: string;
  height: number;
}

const Panel = ({
  format,
  colorSpace,
  label,
  description,
  height,
}: PanelProps) => {
  const { width } = useWindowDimensions();
  const uniforms = useMemo(
    () => ({ resolution: vec(width, height) }),
    [width, height]
  );
  return (
    <View style={styles.panel}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Canvas
        style={{ width, height }}
        pixelFormat={format}
        colorSpace={colorSpace}
      >
        <Fill>
          <Shader source={source} uniforms={uniforms} />
        </Fill>
      </Canvas>
    </View>
  );
};

const PANEL_HEIGHT = 320;

export const HDR = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Panel
        format="bgra8"
        colorSpace="srgb"
        label="bgra8 + sRGB (baseline)"
        description="8-bit sRGB. Banding visible, red disc inside sRGB gamut."
        height={PANEL_HEIGHT}
      />
      <Panel
        format="bgra10"
        colorSpace="p3"
        label="bgra10 + Display P3"
        description="10-bit (BGR10A2Unorm), P3. Smooth gradient, more saturated red."
        height={PANEL_HEIGHT}
      />
      <Panel
        format="rgba16f"
        colorSpace="p3"
        label="rgba16f + Display P3 (HDR / EDR)"
        description="Half-float, EDR on. Sun exceeds SDR white on HDR displays."
        height={PANEL_HEIGHT}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    paddingBottom: 24,
  },
  panel: {
    marginBottom: 12,
  },
  labelRow: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  label: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  description: {
    color: "#aaa",
    fontSize: 11,
    marginTop: 2,
  },
});
