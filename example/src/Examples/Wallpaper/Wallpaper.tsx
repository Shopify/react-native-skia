import {
  Canvas,
  Group,
  LinearGradient,
  Fill,
  vec,
  Paint,
  Rect,
  interpolate,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

const { height, width: wWidth } = Dimensions.get("window");
const length = 9;
const STRIPES = new Array(length).fill(0).map((_, i) => i);
const width = wWidth / length;
const origin = vec(width / 2, height / 2);

export const Wallpaper = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Group>
        <Paint>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, height)}
            colors={["#1A0049", "#2F0604"]}
          />
        </Paint>
        <Fill />
      </Group>
      <Group>
        <Paint>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, height)}
            colors={["#5a3ec3", "#eba5c5", "#e1d4b7", "#e9b74c", "#cf1403"]}
          />
        </Paint>
        {STRIPES.map((i) => (
          <Group
            key={i}
            origin={origin}
            transform={[
              { translateX: i * width },
              {
                scaleY: interpolate(
                  i,
                  [0, (length - 1) / 2, length - 1],
                  [1, 0.6, 1]
                ),
              },
            ]}
          >
            <Rect x={0} y={0} width={width} height={height} />
          </Group>
        ))}
      </Group>
    </Canvas>
  );
};
