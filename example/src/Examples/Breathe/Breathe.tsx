import React, { useEffect, useState } from "react";
import { Dimensions, Image as RNImage } from "react-native";
import type { SkImage } from "@shopify/react-native-skia";
import { Canvas, Skia, Image, useClock } from "@shopify/react-native-skia";
import {
  useFrameCallback,
  useSharedValue,
} from "@shopify/react-native-skia/src/external/reanimated/moduleWrapper";
import type { Video } from "@shopify/react-native-skia/src/skia/types/Video";

const { width, height } = Dimensions.get("window");

const useVideo = () => {
  const [video, setVideo] = useState<Video | null>(null);
  const { uri } = RNImage.resolveAssetSource(require("./sample.mp4"));
  useEffect(() => {
    Skia.Data.fromURI(uri).then(async (response) => {
      const path = Skia.Data.writeToFile(response);
      console.log(path);
      const v = Skia.Video(`file://${path}`);
      setVideo(v);
      response.dispose();
    });
  }, []);
  return video;
};

export const Breathe = () => {
  const image = useSharedValue<SkImage | null>(null);
  const video = useVideo();
  useFrameCallback(({ timestamp }) => {
    if (video === null) {
      return;
    }
    console.log({ timestamp });
    image.value = video.nextImage(10000);
  });
  return (
    <Canvas style={{ flex: 1 }} mode="continuous">
      <Image
        image={image}
        x={0}
        y={0}
        width={width}
        height={height}
        fit="contain"
      />
    </Canvas>
  );
};
