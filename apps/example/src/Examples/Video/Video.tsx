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
<<<<<<< HEAD
import { Platform, Pressable, View, useWindowDimensions } from "react-native";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Slider from "react-native-reanimated-slider";
=======
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useDerivedValue,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
>>>>>>> main

// on Web because of CORS we need to use a local video
const videoURL =
  Platform.OS === "web"
    ? require("../../Tests/assets/BigBuckBunny.mp4").default
    : "https://bit.ly/skia-video";

<<<<<<< HEAD
=======
const SLIDER_HEIGHT = 40;
const KNOB_SIZE = 20;

const clamp = (value: number, min: number, max: number) => {
  "worklet";
  return Math.min(Math.max(value, min), max);
};

>>>>>>> main
export const Video = () => {
  const paused = useSharedValue(false);
  const seek = useSharedValue<number | null>(0);
  const { width, height } = useWindowDimensions();
<<<<<<< HEAD
=======
  const { bottom } = useSafeAreaInsets();
>>>>>>> main
  const fontSize = 20;
  const font = useFont(require("../../assets/SF-Mono-Semibold.otf"), fontSize);
  const { currentFrame, currentTime, duration } = useVideo(videoURL, {
    paused,
    looping: true,
    seek,
    volume: 0,
  });
  const text = useDerivedValue(() => currentTime.value.toFixed(0));
<<<<<<< HEAD
=======

  const sliderWidth = width - 40;
  const isDragging = useSharedValue(false);
  const sliderX = useSharedValue(0);

  useAnimatedReaction(
    () => currentTime.value,
    (time) => {
      if (!isDragging.value && duration > 0) {
        sliderX.value = (time / duration) * sliderWidth;
      }
    }
  );

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      isDragging.value = true;
      sliderX.value = clamp(e.x, 0, sliderWidth);
    })
    .onUpdate((e) => {
      sliderX.value = clamp(e.x, 0, sliderWidth);
    })
    .onEnd(() => {
      const seekTime = (sliderX.value / sliderWidth) * duration;
      seek.value = seekTime;
      isDragging.value = false;
    });

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sliderX.value - KNOB_SIZE / 2 }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: sliderX.value,
  }));

>>>>>>> main
  return (
    <View style={{ flex: 1 }}>
      <Pressable
        style={{ flex: 1 }}
        onPress={() => (paused.value = !paused.value)}
      >
<<<<<<< HEAD
        <Canvas style={{ flex: 1 }} opaque>
=======
        <Canvas style={{ flex: 1 }}>
>>>>>>> main
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
                -0.578, 0.99, 0.588, 0, 0, 0.469, 0.535, -0.003, 0, 0, 0.015,
                1.69, -0.703, 0, 0, 0, 0, 0, 1, 0,
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
<<<<<<< HEAD
      <View style={{ height: 200, backgroundColor: "white" }}>
        <Slider
          style={{ width, height: 40 }}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
          onSlidingComplete={(value: number) => {
            seek.value = value * duration;
            paused.value = false;
          }}
          onSlidingStart={() => {
            paused.value = true;
          }}
        />
=======
      <View style={[styles.sliderContainer, { marginBottom: bottom }]}>
        <GestureDetector gesture={gesture}>
          <View style={[styles.track, { width: sliderWidth }]}>
            <Animated.View style={[styles.progress, progressStyle]} />
            <Animated.View style={[styles.knob, knobStyle]} />
          </View>
        </GestureDetector>
>>>>>>> main
      </View>
    </View>
  );
};
<<<<<<< HEAD
=======

const styles = StyleSheet.create({
  sliderContainer: {
    height: SLIDER_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  track: {
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    justifyContent: "center",
  },
  progress: {
    position: "absolute",
    height: 4,
    backgroundColor: "white",
    borderRadius: 2,
  },
  knob: {
    position: "absolute",
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: "white",
  },
});
>>>>>>> main
