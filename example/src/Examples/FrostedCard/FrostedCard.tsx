import {
  Canvas,
  Skia,
  processTransform3d,
  useImage,
  Image,
  BackdropFilter,
  Fill,
  usePathValue,
  convertToColumnMajor,
  RoundedRect,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSharedValue, withSpring } from "react-native-reanimated";
import { useDerivedValue } from "@shopify/react-native-skia/src/external/reanimated/moduleWrapper";

import { BlurMask } from "./BlurGradient";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = CARD_WIDTH / 1.618;
const rct = Skia.XYWHRect(
  (width - CARD_WIDTH) / 2,
  (height - CARD_HEIGHT) / 2,
  CARD_WIDTH,
  CARD_HEIGHT
);
const rrct = Skia.RRectXY(rct, 10, 10);

const springConfig = (velocity: number) => {
  "worklet";
  return {
    mass: 1,
    damping: 1,
    stiffness: 100,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 2,
    velocity,
  };
};

export const FrostedCard = () => {
  return (
    <View style={{ flex: 1 }}>
      <Canvas style={{ flex: 1 }}>
        <RoundedRect rect={rrct} />
      </Canvas>
    </View>
  );
};
