import React, { useCallback, useMemo, useState } from "react";
import { Dimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import {
  Canvas,
  Fill,
  ImageShader,
  Shader,
  clamp,
} from "@shopify/react-native-skia";

import { snapPoint } from "./Math";
import {
  transition,
  cube,
  pageCurl,
  glitchMemories,
  swirl,
  swap,
} from "./transitions/index";
import { useAssets } from "./Assets";
import { HueRotation } from "./HueRotation";

const { width, height } = Dimensions.get("window");
const transitions = [
  cube,
  pageCurl,
  cube,
  glitchMemories,
  swirl,
  swap,
  cube,
].map((t) => transition(t));

export const Transitions = () => {
  const [offset, setOffset] = useState(1);
  const progressLeft = useSharedValue(0);
  const progressRight = useSharedValue(0);
  const assets = useAssets();
  const updatePage = useCallback(
    (back: boolean) => {
      setOffset((o) => (back ? o - 1 : o + 1));
      progressLeft.value = 0;
      progressRight.value = 0;
    },
    [progressLeft, progressRight]
  );
  const panLeft = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX(-10)
        .onChange((pos) => {
          progressLeft.value = clamp(
            progressLeft.value - pos.changeX / width,
            0,
            1
          );
        })
        .onEnd(({ velocityX }) => {
          const dst = snapPoint(progressLeft.value, -velocityX / width, [0, 1]);
          progressLeft.value = withTiming(dst, { duration: 250 }, () => {
            if (dst === 1) {
              runOnJS(updatePage)(false);
            }
          });
        }),
    [progressLeft, updatePage]
  );
  const panRight = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX(10)
        .onChange((pos) => {
          progressRight.value = clamp(
            progressRight.value + pos.changeX / width,
            0,
            1
          );
        })
        .onEnd(({ velocityX }) => {
          const dst = snapPoint(progressRight.value, velocityX / width, [0, 1]);
          progressRight.value = withTiming(dst, { duration: 250 }, () => {
            if (dst === 1) {
              runOnJS(updatePage)(true);
            }
          });
        }),
    [progressRight, updatePage]
  );

  const uniformsLeft = useDerivedValue(() => {
    return {
      progress: progressLeft.value,
      resolution: [width, height],
    };
  });

  const uniformsRight = useDerivedValue(() => {
    return {
      progress: progressRight.value,
      resolution: [width, height],
    };
  });
  if (!assets) {
    return null;
  }
  return (
    <View style={{ flex: 1 }}>
      <GestureDetector gesture={Gesture.Race(panLeft, panRight)}>
        <Canvas style={{ flex: 1 }}>
          <Fill>
            <Shader source={transitions[offset - 1]} uniforms={uniformsRight}>
              <Shader source={transitions[offset]} uniforms={uniformsLeft}>
                <ImageShader
                  image={assets[offset]}
                  fit="cover"
                  width={width}
                  height={height}
                />
                <ImageShader
                  image={assets[offset + 1]}
                  fit="cover"
                  width={width}
                  height={height}
                />
              </Shader>
              <ImageShader
                image={assets[offset - 1]}
                fit="cover"
                width={width}
                height={height}
              />
            </Shader>
          </Fill>
        </Canvas>
      </GestureDetector>
    </View>
  );
};
