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
  Circle,
  Shadow,
} from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const r = 150;
const c = vec(width / 2, r);
const c1 = vec(width / 2, 75 + 3 * r);

const rct = rrect(rect(c.x - r, c.y - r, 2 * r, 2 * r), r, r);

interface BoxShadowProps {
  dx: number;
  dy: number;
  blur: number;
  box: SkRRect;
  color: Color;
  inner?: boolean;
  children?: React.ReactNode;
}

const BoxShadow = ({
  box,
  blur,
  dx,
  dy,
  color,
  inner,
  children,
}: BoxShadowProps) => {
  const padding = add(vec(10, 10), vec(Math.abs(dx), Math.abs(dy)));
  const ajustedBox = rrect(
    rect(box.rect.x + dx, box.rect.y + dy, box.rect.width, box.rect.height),
    box.rx,
    box.ry
  );
  if (!inner) {
    return (
      <>
        <Group>
          <Paint color={color}>
            <BlurMask blur={blur * 2} style="normal" />
          </Paint>
          <RoundedRect rect={ajustedBox} />
        </Group>
        {children}
      </>
    );
  }
  return (
    <>
      {children}
      <Group clip={box}>
        <Paint color={color}>
          <BlurMask blur={blur * 2} style="normal" />
        </Paint>
        <DiffRect
          inner={ajustedBox}
          outer={rrect(
            rect(
              ajustedBox.rect.x - padding.x,
              ajustedBox.rect.y - padding.y,
              ajustedBox.rect.width + 2 * padding.x,
              box.rect.height + 2 * padding.y
            ),
            0,
            0
          )}
        />
      </Group>
    </>
  );
};

export const Neumorphism = () => {
  const dx = 10;
  const dy = 10;
  return (
    <Canvas style={{ flex: 1 }} mode="continuous" debug>
      <Fill color="lightblue" />
      <BoxShadow box={rct} color="blue" dx={dx} dy={dy} blur={15} inner>
        <RoundedRect rect={rct} color="white" />
      </BoxShadow>
      {/* <Group transform={[{ translateY: 300 }]}>
        <RoundedRect rect={rct} color="white" />
        <BoxShadow box={rct} color="blue" dx={dx} dy={dy} blur={15} inner />
      </Group> */}
      <Group>
        <Paint>
          <Shadow dx={dx} dy={dy} blur={15} color="blue" inner />
        </Paint>
        <Circle c={c1} r={r} color="white" />
      </Group>
    </Canvas>
  );
};
