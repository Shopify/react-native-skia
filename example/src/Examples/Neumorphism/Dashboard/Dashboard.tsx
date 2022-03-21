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
  useFont,
  vec,
} from "@shopify/react-native-skia";

import { Title } from "./components/Title";
import { ProgressBar } from "./components/ProgressBar";
import { Snow } from "./components/icons/Snow";
import { Control } from "./components/Control";
import { Wind } from "./components/icons/Wind";
import { Sun } from "./components/icons/Sun";
import { Power } from "./components/icons/Power";

const window = Dimensions.get("window");
const width = 390;
const height = 844;

export const Neumorphism = () => {
  const font = useFont(require("./components/SF-Pro-Display-Bold.otf"), 17);
  if (!font) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }}>
      <FitBox
        src={rect(0, 0, width, height)}
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
        <Control
          x={0}
          y={464}
          label="Ac"
          active={true}
          progress={0.3}
          font={font}
        >
          <Snow />
        </Control>
        <Control x={0} y={464 + 75} label="Fan" font={font}>
          <Wind />
        </Control>
        <Control x={0} y={464 + 140} label="Heat" font={font}>
          <Sun />
        </Control>
        <Control x={0} y={464 + 140 + 75} label="Auto" font={font}>
          <Power />
        </Control>
      </FitBox>
    </Canvas>
  );
};
