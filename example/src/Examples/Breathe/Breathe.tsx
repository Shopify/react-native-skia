import React from "react";
import { Image as RNImage, useWindowDimensions } from "react-native";
import { Canvas, Skia, Image } from "@shopify/react-native-skia";

const url = RNImage.resolveAssetSource(require("./sample.mp4")).uri;
const video = Skia.Video(url);
const image = video.nextImage(0).makeNonTextureImage();

export const Breathe = () => {
  const { width, height } = useWindowDimensions();

  return (
    <Canvas style={{ flex: 1 }}>
      <Image image={image} x={0} y={0} width={width} height={height} />
    </Canvas>
  );
};
