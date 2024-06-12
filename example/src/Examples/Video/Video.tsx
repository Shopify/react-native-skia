import React from "react";
import {
  Canvas,
  ColorMatrix,
  Fill,
  ImageShader,
  Text,
  useFont,
  useVideo,
} from "@shopify/react-native-skia";
import { Platform, Pressable, View, useWindowDimensions } from "react-native";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";
import Slider from "@react-native-community/slider";

// on Web because of CORS we need to use a local video
const videoURL =
  Platform.OS === "web"
    ? require("../../Tests/assets/BigBuckBunny.mp4").default
    : "https://bit.ly/skia-video";

export const Video = () => {
  const paused = useSharedValue(false);
  const seek = useSharedValue(0);
  const { width, height } = useWindowDimensions();
  const fontSize = 20;
  const font = useFont(require("../../assets/SF-Mono-Semibold.otf"), fontSize);
  const { currentFrame, currentTime, duration } = useVideo(videoURL, {
    paused,
    looping: true,
    seek,
    volume: 0,
  });
  const text = useDerivedValue(() => currentTime.value.toFixed(0));
  return (
    <View style={{ flex: 1 }}>
      <Pressable
        style={{ flex: 1 }}
        onPress={() => (paused.value = !paused.value)}
      >
        <Canvas style={{ flex: 1 }}>
          <Fill>
            <ImageShader
              image={currentFrame}
              x={0}
              y={0}
              width={width}
              height={height}
              fit="cover"
            />
            <ColorMatrix
              matrix={[
                0.95, 0, 0, 0, 0.05, 0.65, 0, 0, 0, 0.15, 0.15, 0, 0, 0, 0.5, 0,
                0, 0, 1, 0,
              ]}
            />
          </Fill>
          <Text
            x={20}
            y={height - 200 - 2 * fontSize}
            text={text}
            font={font}
          />
        </Canvas>
      </Pressable>
      <View style={{ height: 200 }}>
        <Slider
          style={{ width, height: 40 }}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
          onSlidingComplete={(value) => {
            seek.value = value * duration;
            paused.value = false;
          }}
          onSlidingStart={() => {
            paused.value = true;
          }}
        />
      </View>
    </View>
  );
};
