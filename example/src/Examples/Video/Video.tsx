import React from "react";
import { Canvas, Fill, ImageShader } from "@shopify/react-native-skia";
import { useWindowDimensions } from "react-native";

import { useVideoFromAsset } from "../../components/Animations";

export const Video = () => {
  const { width, height } = useWindowDimensions();
  const video = useVideoFromAsset(
    require("../../Tests/assets/BigBuckBunny.mp4")
  );
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill>
        <ImageShader
          image={video}
          x={0}
          y={0}
          width={width}
          height={height}
          fit="cover"
        />
      </Fill>
    </Canvas>
  );
};
