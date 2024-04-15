import React, { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import type { SkImage } from "@shopify/react-native-skia";
import {
  Canvas,
  Skia,
  ImageShader,
  Shader,
  Fill,
} from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";
import {
  runOnUI,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";
import type { Video } from "@shopify/react-native-skia/src/skia/types/Video";
import { useAssets } from "expo-asset";

const { width, height } = Dimensions.get("window");

const createVideo = (video: SharedValue<Video | null>, uri: string) => {
  "worklet";
  const v = Skia.Video(uri);
  video.value = v;
};

const useVideo = (_uri: string) => {
  const [assets] = useAssets([require("./sample.mp4")]);
  const video = useSharedValue<Video | null>(null);
  useEffect(() => {
    if (assets === undefined) {
      return;
    }
    const asset = assets[0];
    if (video.value === null) {
      runOnUI(createVideo)(video, asset.localUri!);
    }
  }, [assets, video]);
  return video;
};

const source = Skia.RuntimeEffect.Make(`
uniform shader image;


half4 main(vec2 fragcoord) { 
  return image.eval(fragcoord);
  // float2 iResolution = vec2(${width}.0, ${height}.0);
  // float2 uv = fragcoord / iResolution;

  // float y = uv.y * 3.0;
  // half4 c = image.eval(vec2(uv.x, mod(y, 1.0)) * vec2(400.0, 640.0)).bgra;
  // return vec4(
  //   c.r * step(2.0, y) * step(y, 3.0),
  //   c.g * step(1.0, y) * step(y, 2.0),
  //   c.b * step(0.0, y) * step(y, 1.0),
  //   1.0);
}
`)!;

export const Breathe = () => {
  const lastTimestamp = useSharedValue<number>(0);
  const image = useSharedValue<SkImage | null>(null);
  const video = useVideo(require("./sample.mp4"));
  useFrameCallback(({ timestamp }) => {
    if (video.value === null) {
      return;
    }
    if (timestamp - lastTimestamp.value > 500) {
      lastTimestamp.value = timestamp;
      if (image.value) {
        image.value.dispose();
      }
      console.log("nextImage()");
      image.value = video.value.nextImage(timestamp);
    }
  });
  return (
    <Canvas style={{ flex: 1 }} mode="continuous">
      <Fill>
        <Shader source={source}>
          <ImageShader
            image={image}
            x={0}
            y={0}
            width={width}
            height={height}
            fit="cover"
          />
        </Shader>
      </Fill>
    </Canvas>
  );
};
