import type {
  SkCanvas,
  SkFont,
  SkImage,
  SkSize,
  SkSurface,
} from "@shopify/react-native-skia";
import {
  BlurStyle,
  ClipOp,
  FilterMode,
  MipmapMode,
  Skia,
  TileMode,
  interpolateColors,
  useFont,
  vec,
} from "@shopify/react-native-skia";
import { useSharedValue } from "@shopify/react-native-skia/src/external/reanimated/moduleWrapper";
import { useFrameCallback } from "react-native-reanimated";

export const useCanvasAsTexture = (
  cb: (surface: SkSurface, timestamp: number) => void,
  size: SkSize
) => {
  const surface = useSharedValue<SkSurface | null>(null);
  const texture = useSharedValue<SkImage | null>(null);
  useFrameCallback(({ timestamp }) => {
    if (surface.value === null) {
      surface.value = Skia.Surface.MakeOffscreen(size.width, size.height);
    }
    cb(surface.value!, timestamp);
    texture.value = surface.value!.makeImageSnapshot();
  });
  return texture;
};

const source = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform vec2 iResolution;
vec4 main(vec2 fragCoord )
{
    float effectRadius = 1.0;
    float effectAngle = 1.0 * 3.14159;
    
    vec2 center = vec2(.5, .5);
    
    vec2 uv = fragCoord.xy / iResolution.xy - center;
    
    float len = length(uv * vec2(iResolution.x / iResolution.y, 1.));
    float angle = atan(uv.y, uv.x) + effectAngle * smoothstep(effectRadius, 0., len);
    float radius = length(uv);

    return image.eval((vec2(radius * cos(angle), radius * sin(angle)) + center)*iResolution.xy);
}`)!;

export const COLS = 16;
export const ROWS = COLS;

const cols = new Array(COLS).fill(0).map((_, i) => i);
const rows = new Array(ROWS).fill(0).map((_, i) => i);
const pos = vec(0, 0);

const textureSize = {
  width: 1000,
  height: 1000,
};

const size = {
  width: 250,
  height: 250,
};
const symbol = { width: size.width / COLS, height: size.height / ROWS };

const randomArray = (from: number, to: number, blank?: boolean) => {
  const s = Math.round(from + Math.random() * (to - from));
  const a = new Array(s).fill(0).map((_, i) => (blank ? 0 : i / s));
  return a.reverse();
};

const streams = cols.map(() =>
  new Array(3)
    .fill(0)
    .map(() => [
      ...randomArray(1, 1, true),
      ...randomArray(4, 16),
      ...randomArray(2, 1, true),
    ])
    .flat()
);

const paint = Skia.Paint();
paint.setMaskFilter(Skia.MaskFilter.MakeBlur(BlurStyle.Solid, 5, true));

interface State {
  stream: number[];
  offset: number;
  range: number;
}

const state: Record<string, State> = {};
cols.forEach((_i, i) =>
  rows.forEach((_j, j) => {
    state[`${i}-${j}`] = {
      stream: streams[i],
      offset: Math.round(Math.random() * (26 - 1)),
      range: 100 + Math.random() * 900,
    };
  })
);

const drawTexture = (
  font: SkFont | null,
  canvas: SkCanvas,
  timestamp: number
) => {
  "worklet";
  if (font === null) {
    return;
  }
  const symbols = font.getGlyphIDs("abcdefghijklmnopqrstuvwxyz");
  canvas.save();
  //canvas.drawColor(Skia.Color("rgba(0,0,0,0)"));
  canvas.clipRect(Skia.XYWHRect(0, 0, 256, 256), ClipOp.Intersect, false);
  canvas.drawColor(Skia.Color("rgba(0,20,0,0.3)"));
  cols.forEach((_i, i) =>
    rows.forEach((_j, j) => {
      const { stream, offset, range } = state[`${i}-${j}`];
      const x = i * symbol.width;
      const y = j * symbol.height;

      const glyphs = (() => {
        const idx = offset + Math.floor(timestamp / range);
        return [symbols[idx % symbols.length]];
      })();

      const opacity = (() => {
        const idx = Math.round(timestamp / 100);
        return stream[(stream.length - j + idx) % stream.length];
      })();

      const color = (() =>
        interpolateColors(
          opacity,
          [0.8, 0.9, 1],
          ["rgb(0, 255, 70)", "rgb(140, 255, 170)", "#B3B5B2"]
        ))();
      paint.setColor(Float32Array.of(...color));
      paint.setAlphaf(opacity);
      canvas.drawGlyphs(
        glyphs,
        [pos],
        x + symbol.width / 4,
        y + symbol.height,
        font,
        paint
      );
    })
  );
  canvas.restore();
};

export const useMatrixTexture = () => {
  const font = useFont(require("../matrix-code-nfi.otf"), symbol.height);
  const texture = useCanvasAsTexture((surface, timestamp) => {
    "worklet";
    const canvas = surface.getCanvas();
    drawTexture(font, canvas, timestamp);
    return surface.makeImageSnapshot();
  }, textureSize);
  return texture;
};
