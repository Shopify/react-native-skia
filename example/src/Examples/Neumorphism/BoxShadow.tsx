import React from "react";
import type { Color, SkRRect } from "@shopify/react-native-skia";
import {
  add,
  BlurMask,
  DiffRect,
  Group,
  Paint,
  Canvas,
  Fill,
  vec,
  rrect,
  rect,
  RoundedRect,
} from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const c = vec(width / 2, height / 2);
const r = 150;

const rct = rrect(rect(c.x - r, c.y - r, 2 * r, 2 * r), r, r);

interface BoxShadowProps {
  dx: number;
  dy: number;
  blur: number;
  box: SkRRect;
  color: Color;
  inner?: boolean;
}

const BoxShadow = ({ box, blur, dx, dy, color }: BoxShadowProps) => {
  const padding = add(vec(10, 10), vec(Math.abs(dx), Math.abs(dy)));
  return (
    <Group clip={box}>
      <Paint color={color}>
        <BlurMask blur={blur} style="solid" />
      </Paint>
      <DiffRect
        inner={box}
        outer={rrect(
          rect(
            box.rect.x - padding.x,
            box.rect.y - padding.y,
            box.rect.width + 2 * padding.x,
            box.rect.height + 2 * padding.y
          ),
          0,
          0
        )}
      />
    </Group>
  );
};

export const Neumorphism = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Fill color="lightblue" />
      <RoundedRect rect={rct} color="white" />
      <BoxShadow box={rct} color="blue" dx={0} dy={0} blur={15} inner />
    </Canvas>
  );
};
