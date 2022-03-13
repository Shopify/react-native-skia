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
  Path,
  Text,
  Skia,
  useLoop,
  SweepGradient,
  useDerivedValue,
  mix,
  useFont,
  InnerShadow,
  RoundedRect,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const c = vec(width / 2, height / 2 - 85);
const r = 85;
const r1 = 60;

const meter = Skia.Path.Make();
meter.addCircle(c.x, c.y, r);

export const Neumorphism = () => {
  const font = useFont(require("./SF-Mono-Semibold.otf"), 32);
  const progress = useLoop({ duration: 15000 });
  const end = useDerivedValue(
    () => mix(progress.current, 0.2, 0.95),
    [progress]
  );
  const text = useDerivedValue(
    () => `${Math.round(end.current * 100)}%`,
    [end]
  );
  if (font === null) {
    return null;
  }
  const pos = font.measureText("30%");
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
          <SweepGradient c={c} colors={["#2FB8FF", "#9EECD9"]} />
        </Paint>
        <Path
          path={meter}
          strokeWidth={20}
          start={0.1}
          end={end}
          style="stroke"
          strokeCap="round"
        />
      </Group>
      <Group>
        <Paint>
          <InnerShadow
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
          <InnerShadow dx={26} dy={26} blur={81} color="rgba(0, 0, 0, 0.5)" />
        </Paint>
        <Circle c={c} r={r1} color="#32363B" />
      </Group>
      <Text
        x={c.x - pos.width / 2}
        y={c.y + pos.height / 2}
        font={font}
        text={text}
        color="white"
      />
      <Group>
        <Paint>
          <InnerShadow
            dx={-3}
            dy={-3}
            blur={6}
            color="rgba(255, 255, 255, 0.25)"
          />
          <InnerShadow dx={6} dy={6} blur={6} color="black" />
        </Paint>
        <RoundedRect
          x={32}
          y={height / 2 + 32}
          width={width - 64}
          height={height / 2 - 32}
          rx={25}
          ry={25}
          color="#202122"
        />
      </Group>
    </Canvas>
  );
};
