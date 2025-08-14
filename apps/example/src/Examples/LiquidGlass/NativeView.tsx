import {
  Canvas,
  Skia,
  useClock,
  Image as SkImage,
  Fill,
  ColorMatrix,
  notifyChange,
} from "@shopify/react-native-skia";
import React, { useLayoutEffect, useRef } from "react";
import {
  View,
  PixelRatio,
  StyleSheet,
  findNodeHandle,
  Platform,
} from "react-native";
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

const style = {
  flex: 1,
  overflow: "hidden" as const,
};

export const NativeView = () => {
  const canvasSize = useSharedValue({ width: 0, height: 0 });
  const viewTag = useRef(-1);
  const image = useSharedValue(Skia.Image.MakeNull());
  const ref = useRef<View>(null);
  const clock = useClock();
  const imageHeight = 1920 / PixelRatio.get();

  const translateY = useDerivedValue(() => clock.value / 10);

  useLayoutEffect(() => {
    viewTag.current = findNodeHandle(ref.current)!;
    if (Platform.OS === "android") {
      console.log("SetRenderEffect!");
      Skia.Image.setRenderEffectAndroid(viewTag.current, "");
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: -translateY.value % imageHeight }],
    };
  });

  useAnimatedReaction(
    () => clock.value,
    () => {
      if (Platform.OS === "ios") {
        Skia.Image.MakeImageFromViewTagSync(viewTag.current, image.value);
        notifyChange(image);
      }
    }
  );

  const rect = useDerivedValue(() => ({
    x: 0,
    y: 0,
    width: canvasSize.value.width,
    height: canvasSize.value.height,
  }));

  return (
    <View style={{ flex: 1 }}>
      <View style={style} collapsable={false} ref={ref}>
        <Animated.Image
          style={[
            {
              resizeMode: "repeat",
              width: "100%",
              height: imageHeight * 2,
            },
            animatedStyle,
          ]}
          source={require("./assets/flowers.jpg")}
        />
        <Animated.Image
          style={[
            {
              resizeMode: "repeat",
              width: "100%",
              height: imageHeight * 2,
            },
            animatedStyle,
          ]}
          source={require("./assets/flowers.jpg")}
        />
      </View>
      <Canvas style={StyleSheet.absoluteFillObject} onSize={canvasSize}>
        <SkImage image={image} rect={rect}>
          <ColorMatrix
            matrix={[
              -0.578, 0.99, 0.588, 0, 0, 0.469, 0.535, -0.003, 0, 0, 0.015,
              1.69, -0.703, 0, 0, 0, 0, 0, 1, 0,
            ]}
          />
        </SkImage>
      </Canvas>
    </View>
  );
};
