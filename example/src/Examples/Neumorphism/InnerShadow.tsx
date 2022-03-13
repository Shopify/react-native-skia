import {
  Canvas,
  Circle,
  Fill,
  Group,
  LinearGradient,
  Paint,
  add,
  vec,
  DropShadow,
  InnerShadow,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const c = vec(width / 2, height / 2);
const r = 85;
const r1 = 60;

export const Neumorphism = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Group>
        <Paint>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, height)}
            colors={["#2A2D32", "#131313"]}
          />
        </Paint>
        <Fill />
      </Group>
      <Group>
        <Paint>
          <LinearGradient
            start={add(c, vec(-r, 0))}
            end={add(c, vec(r, 0))}
            colors={["#2B2F33", "#101113"]}
          />
          <DropShadow dx={18} dy={18} blur={65} color="#141415" />
          <DropShadow dx={-18} dy={-18} blur={65} color="#485057" />
        </Paint>
        <Circle c={c} r={r} />
      </Group>
      <Group>
        <Paint>
          <InnerShadow dx={2} dy={1} blur={2} color="rgba(255, 255, 255, 0.5)">
            <InnerShadow
              dx={-26}
              dy={-26}
              blur={66}
              color="rgba(59, 68, 81, 0.5)"
            >
              <InnerShadow
                dx={26}
                dy={26}
                blur={81}
                color="rgba(0, 0, 0, 0.5)"
              />
            </InnerShadow>
          </InnerShadow>
        </Paint>
        <Circle c={c} r={r1} color="#32363B" />
      </Group>
    </Canvas>
  );
};

/* <InnerShadow
dx={2}
dy={1}
blur={2}
color="rgba(255, 255, 255, 0.5)"
/>
<InnerShadow
dx={-26}
dy={-26}
blur={66}
color="rgba(59, 68, 81, 0.5)"
/>
<InnerShadow dx={26} dy={26} blur={81} color="rgba(0, 0, 0, 0.5)" /> */
