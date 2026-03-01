import React, { useMemo } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import {
  Atlas,
  BlendMode,
  Canvas,
  Picture,
  Skia,
  createPicture,
  rect,
} from "@shopify/react-native-skia";

import { Title } from "./components/Title";

const SPRITE_SIZE = 24;
const PADDING = 16;

const palette = [
  "#6C63FF",
  "#FF6B6B",
  "#4ECDC4",
  "#FFE66D",
  "#A8E6CF",
  "#FF8B94",
  "#845EC2",
  "#00C9A7",
];

const makeDotImage = () => {
  const surface = Skia.Surface.Make(SPRITE_SIZE, SPRITE_SIZE);
  if (!surface) {
    return null;
  }
  const canvas = surface.getCanvas();
  canvas.clear(Float32Array.of(0, 0, 0, 0));
  const paint = Skia.Paint();
  paint.setColor(Skia.Color("white"));
  paint.setAntiAlias(true);
  canvas.drawCircle(SPRITE_SIZE / 2, SPRITE_SIZE / 2, SPRITE_SIZE / 2, paint);
  return surface.makeImageSnapshot();
};

const dotImage = makeDotImage();
const spriteRect = rect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

export const AtlasExample = () => {
  const { width } = useWindowDimensions();
  const cols = Math.floor((width - 2 * PADDING) / (SPRITE_SIZE + 8));
  const rows = 4;
  const count = cols * rows;
  const canvasHeight = rows * (SPRITE_SIZE + 8) + 2 * PADDING;

  const sprites = useMemo(
    () => new Array(count).fill(spriteRect),
    [count]
  );

  const transforms = useMemo(
    () =>
      new Array(count).fill(0).map((_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        return Skia.RSXform(
          1,
          0,
          PADDING + col * (SPRITE_SIZE + 8),
          PADDING + row * (SPRITE_SIZE + 8)
        );
      }),
    [count, cols]
  );

  const colors = useMemo(
    () =>
      new Array(count)
        .fill(0)
        .map((_, i) => Skia.Color(palette[i % palette.length])),
    [count]
  );

  const imperativePicture = useMemo(() => {
    if (!dotImage) {
      return null;
    }
    const srcs = sprites.map(() => Skia.XYWHRect(0, 0, SPRITE_SIZE, SPRITE_SIZE));
    return createPicture(
      (canvas) => {
        const paint = Skia.Paint();
        canvas.drawAtlas(dotImage, srcs, transforms, paint, BlendMode.DstIn, colors);
      },
      { x: 0, y: 0, width, height: canvasHeight }
    );
  }, [sprites, transforms, colors, width, canvasHeight]);

  return (
    <ScrollView>
      <Title>Default (dstOver)</Title>
      <Canvas style={{ width, height: canvasHeight }}>
        <Atlas
          image={dotImage}
          sprites={sprites}
          transforms={transforms}
          colors={colors}
        />
      </Canvas>
      <Title>colorBlendMode: dstIn</Title>
      <Canvas style={{ width, height: canvasHeight }}>
        <Atlas
          image={dotImage}
          sprites={sprites}
          transforms={transforms}
          colors={colors}
          colorBlendMode="dstIn"
        />
      </Canvas>
      <Title>Imperative API (dstIn)</Title>
      <Canvas style={{ width, height: canvasHeight }}>
        {imperativePicture && <Picture picture={imperativePicture} />}
      </Canvas>
    </ScrollView>
  );
};
