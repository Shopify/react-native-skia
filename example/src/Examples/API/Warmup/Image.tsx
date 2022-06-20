import React from "react";
import { Image as RNImage } from "react-native";
import type { SkImage as SKImageModel } from "@shopify/react-native-skia";
import {
  Group,
  mix,
  useDerivedValue,
  Easing,
  useTiming,
  SkiaView,
  useDrawCallback,
  Canvas,
  Image as SkImage,
  Skia,
} from "@shopify/react-native-skia";

const loadImage = (source: ReturnType<typeof require>) =>
  Skia.Data.fromURI(RNImage.resolveAssetSource(source).uri);

export const loadImageWeb = (source: ReturnType<typeof require>) => {
  return Skia.Image.MakeImageFromEncoded(
    Skia.Data.fromBase64(source.substring(source.indexOf(",") + 1))
  )!;
};

const images: { [name: string]: null | SKImageModel } = {
  zurich: null,
  zurich2: null,
  zurich3: null,
};

loadImage(require("./assets/zurich.jpg")).then((image) => {
  images.zurich = Skia.Image.MakeImageFromEncoded(image);
});
loadImage(require("./assets/zurich2.jpg")).then((image) => {
  images.zurich2 = Skia.Image.MakeImageFromEncoded(image);
});
loadImage(require("./assets/zurich3.jpg")).then((image) => {
  images.zurich3 = Skia.Image.MakeImageFromEncoded(image);
});

interface IconProps {
  name: keyof typeof images;
  size: number;
}

export const ImageImp = ({ name, size }: IconProps) => {
  const image = images[name]!;
  const onDraw = useDrawCallback((canvas) => {
    canvas.drawImageRect(
      image,
      Skia.XYWHRect(0, 0, image.width(), image.height()),
      Skia.XYWHRect(0, 0, size, size),
      Skia.Paint()
    );
  });
  if (!image) {
    return null;
  }
  return (
    <SkiaView style={{ flex: 1 }} onDraw={onDraw} mode="continuous" debug />
  );
};

export const ImageDecl = ({ name, size }: IconProps) => {
  const progress = useTiming(
    { to: 1, loop: true, yoyo: true },
    { duration: 3000, easing: Easing.bezier(0.65, 0, 0.35, 1) }
  );
  const transform = useDerivedValue(
    () => [{ translateX: mix(progress.current, 0, size) }],
    [progress]
  );
  const image = images[name];
  if (!image) {
    return null;
  }
  return (
    <Canvas style={{ height: size, width: size }}>
      <Group transform={transform}>
        <SkImage image={image} x={0} y={0} width={size} height={size} />
      </Group>
    </Canvas>
  );
};

export const Image = ImageDecl;
