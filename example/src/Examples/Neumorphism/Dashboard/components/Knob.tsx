import React from "react";
import {
  RoundedRect,
  Group,
  LinearGradient,
  vec,
  Paint,
} from "@shopify/react-native-skia";

export const Knob = () => {
  return (
    <Group>
      <Group>
        <Paint>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(27.5, 17)}
            colors={["#2E3236", "#141515"]}
          />
        </Paint>
        <RoundedRect x={0} y={0} width={27.5} height={17} r={6} />
      </Group>
      {/* <Group>
        <Paint>
          <InnerShadow
            dx={-1}
            dy={-1}
            blur={1}
            color="rgba(255, 255, 255, 0.7)"
          />
          <InnerShadow dx={1} dy={1} blur={1} color="rgba(0, 0, 0, 0.39)" />
        </Paint>
        <RoundedRect width={3} height={13} color="#272A2E" x={9} y={2} r={1} />
      </Group>
      <Group>
        <Paint>
          <InnerShadow
            dx={-1}
            dy={-1}
            blur={1}
            color="rgba(255, 255, 255, 0.7)"
          />
          <InnerShadow dx={1} dy={1} blur={1} color="rgba(0, 0, 0, 0.39)" />
        </Paint>
        <RoundedRect
          width={3}
          height={13}
          color="#272A2E"
          x={14.75}
          y={2}
          r={1}
        />
      </Group> */}
    </Group>
  );
};
