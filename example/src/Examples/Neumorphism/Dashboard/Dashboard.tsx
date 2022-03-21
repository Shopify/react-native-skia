import React from "react";
import { Dimensions } from "react-native";
import {
  Canvas,
  Fill,
  FitBox,
  Group,
  LinearGradient,
  Paint,
  rect,
  vec,
} from "@shopify/react-native-skia";

import { Title } from "./components/Title";
import { ProgressBar } from "./components/ProgressBar";

const window = Dimensions.get("window");
const width = 390;
const height = 844;

export const Neumorphism = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <FitBox
        src={rect(0, 0, 390, 844)}
        dst={rect(0, 0, window.width, window.height)}
        fit="cover"
      >
        <Group>
          <Paint>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, height)}
              colors={["#2A2D32", "#212326", "#131313"]}
            />
          </Paint>
          <Fill />
        </Group>
        <Title title="Climate" />
        <ProgressBar progress={0.3} />
      </FitBox>
    </Canvas>
  );
};
