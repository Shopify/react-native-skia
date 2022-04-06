import {
  Canvas,
  Group,
  LinearGradient,
  Fill,
  vec,
  Paint,
  Rect,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

const { height, width: wWidth } = Dimensions.get("window");
const length = 9;
const STRIPES = new Array(Math.ceil(length / 2)).fill(0).map((_, i) => i);
const width = wWidth / length;
const origin = vec(width / 2, height / 2);

// 0 -> 1
// 1 -> 0.9
// 2 -> 0.8
// 3 -> 0.7

// 4 -> 0.6

// 5 -> 0.7
// 6 -> 0.8
// 7 -> 0.9
// 8 -> 1

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
            transform={[{ translateX: i * width }, { scaleY: 1 - 0.1 * i }]}
          >
            <Rect x={0} y={0} width={width} height={height} />
          </Group>
        ))}
        <Group
          transform={[{ translateX: 5 * width }, { scaleX: -1 }]}
          origin={vec(4 * width, height / 2)}
        >
          {STRIPES.map((i) => (
            <Group
              key={i}
              origin={origin}
              transform={[
                { translateX: (4 + i) * width },
                { scaleY: 1 - 0.1 * i },
              ]}
            >
              <Rect x={0} y={0} width={width} height={height} />
            </Group>
          ))}
        </Group>
      </Group>
    </Canvas>
  );
};
