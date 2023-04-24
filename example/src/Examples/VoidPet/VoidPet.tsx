import { Canvas, Group } from "@shopify/react-native-skia";
import React, { useEffect } from "react";
import {
  Easing,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Dimensions, ScrollView } from "react-native";

import { Pet } from "./Pet";

const pets = new Array(30).fill(0).map((_, i) => i);
const { width } = Dimensions.get("window");

const speed = 2;
const tweenDuration = speed * 200;
const size = 95;
const petPerRow = Math.floor(width / size);

export const VoidPet = () => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: tweenDuration, easing: Easing.linear }),
      Infinity,
      true
    );
  }, [progress]);

  return (
    <ScrollView>
      <Canvas
        style={{ height: size * Math.floor(pets.length / petPerRow) }}
        mode="continuous"
      >
        {pets.map((i) => (
          <Group
            transform={[
              { translateY: size * Math.floor(i / petPerRow) },
              { translateX: size * (i % petPerRow) + 2 },
            ]}
          >
            <Pet key={i} progress={progress} size={size} />
          </Group>
        ))}
      </Canvas>
    </ScrollView>
  );
};
