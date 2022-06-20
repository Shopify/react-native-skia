import React from "react";
import { Image as RNImage } from "react-native";
import type { SkImage as SKImageModel } from "@shopify/react-native-skia";
import { Canvas, Image as SkImage, Skia } from "@shopify/react-native-skia";

const loadImage = (source: ReturnType<typeof require>) =>
  Skia.Data.fromURI(RNImage.resolveAssetSource(source).uri);

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

export const Image = ({ name, size }: IconProps) => {
  const image = images[name];
  if (!image) {
    return null;
  }
  return (
    <Canvas style={{ height: size, width: size }}>
      <SkImage image={image} x={0} y={0} width={size} height={size} />
    </Canvas>
  );
};
