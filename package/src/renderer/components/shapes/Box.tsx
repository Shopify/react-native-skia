import React from "react";

import type { Color, SkRRect } from "../../../skia";
import type { CustomPaintProps } from "../../processors";
import { add, vec, rrect } from "../../processors";
import { rect } from "../../processors/Rects";
import { Group } from "../Group";
import { BlurMask } from "../maskFilters";
import { Paint } from "../Paint";

import { DiffRect } from "./DiffRect";
import { RoundedRect } from "./RoundedRect";

const inflate = (box: SkRRect, dx: number, dy: number, tx = 0, ty = 0) =>
  rrect(
    rect(
      box.rect.x - dx + tx,
      box.rect.y - dy + ty,
      box.rect.width + 2 * dx,
      box.rect.height + 2 * dy
    ),
    box.rx + dx,
    box.ry + dy
  );

const deflate = (box: SkRRect, dx: number, dy: number, tx = 0, ty = 0) =>
  inflate(box, -dx, -dy, tx, ty);

interface BoxShadow {
  dx?: number;
  dy?: number;
  spread?: number;
  blur: number;
  color?: Color;
  inner?: boolean;
}

interface BoxProps extends CustomPaintProps {
  box: SkRRect;
  shadows: BoxShadow[];
}

export const Box = ({ box, shadows, ...props }: BoxProps) => {
  return (
    <>
      {shadows
        .filter((shadow) => !shadow.inner)
        .map((shadow, key) => {
          const { color = "black", blur, spread = 0, dx = 0, dy = 0 } = shadow;
          return (
            <Group key={key}>
              <Paint color={color}>
                <BlurMask blur={blur * 2} style="normal" />
              </Paint>
              <RoundedRect rect={inflate(box, spread, spread, dx, dy)} />
            </Group>
          );
        })}
      <RoundedRect rect={box} {...props} />
      {shadows
        .filter((shadow) => shadow.inner)
        .map((shadow, key) => {
          const { color = "black", blur, spread = 0, dx = 0, dy = 0 } = shadow;
          const delta = add(vec(10, 10), vec(Math.abs(dx), Math.abs(dy)));
          return (
            <Group clip={box} key={key}>
              <Paint color={color}>
                <BlurMask blur={blur * 2} style="normal" />
              </Paint>
              <DiffRect
                inner={deflate(box, spread, spread, dx, dy)}
                outer={inflate(box, delta.x, delta.y)}
              />
            </Group>
          );
        })}
    </>
  );
};

Box.defaultProps = {
  shadows: [],
};
