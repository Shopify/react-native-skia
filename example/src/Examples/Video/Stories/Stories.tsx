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
  useVideo,
} from "@shopify/react-native-skia";

import { snapPoint } from "../../../components/Animations";
import { cube, transition } from "../gltransitions";

import { useAssets } from "./Assets";

const { width, height } = Dimensions.get("window");
const transitions = [cube, cube, cube].map((t) => transition(t));

const at = <T,>(array: T[] | null, index: number): T | null => {
  "worklet";
  if (array === null) {
    return null;
  }
  return array[((index % array.length) + array.length) % array.length];
};

const duration = 100;

export const Stories = () => {
  const [offset, setOffset] = useState(0);
  const progressLeft = useSharedValue(0);
  const progressRight = useSharedValue(0);
  const assets = useAssets();
  const next = useCallback(() => {
    setOffset((o) => o + 1);
    progressLeft.value = 0;
  }, [progressLeft]);
  const previous = useCallback(() => {
    setOffset((o) => o - 1);
    progressRight.value = 0;
  }, [progressRight]);
  const panRight = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          progressRight.value = 0;
        })
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
          progressRight.value = withTiming(dst, { duration }, () => {
            runOnJS(previous)();
          });
        }),
    [previous, progressRight]
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
          progressLeft.value = withTiming(dst, { duration }, () => {
            runOnJS(next)();
          });
        }),
    [next, progressLeft]
  );

  const uniformsRight = useDerivedValue(() => {
    return {
      progress: progressRight.value,
      resolution: [width, height],
    };
  });

  const uniformsLeft = useDerivedValue(() => {
    return {
      progress: progressLeft.value,
      resolution: [width, height],
    };
  });
  const transition1 = useDerivedValue(() => {
    return at(transitions, offset - 1)!;
  });

  const transition2 = useDerivedValue(() => {
    return at(transitions, offset)!;
  });

  const video1 = useVideo(at(assets, offset - 1), true);
  const video2 = useVideo(at(assets, offset), true);
  const video3 = useVideo(at(assets, offset + 1), true);

  if (!assets) {
    return null;
  }
  return (
    <View style={{ flex: 1 }}>
      <GestureDetector gesture={Gesture.Race(panRight, panLeft)}>
        <Canvas style={{ flex: 1 }}>
          <Fill>
            <Shader source={transition1} uniforms={uniformsRight}>
              <Shader source={transition2} uniforms={uniformsLeft}>
                <ImageShader
                  image={video1}
                  fit="cover"
                  width={width}
                  height={height}
                />
                <ImageShader
                  image={video2}
                  fit="cover"
                  width={width}
                  height={height}
                />
              </Shader>
              <ImageShader
                image={video3}
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
