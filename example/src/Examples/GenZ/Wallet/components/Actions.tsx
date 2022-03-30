/* eslint-disable max-len */
import {
  Group,
  Path,
  rect,
  RoundedRect,
  rrect,
  Text,
  Image,
  ColorMatrix,
  Paint,
  useDerivedValue,
  OpacityMatrix,
} from "@shopify/react-native-skia";
import React from "react";
import type { SkiaReadonlyValue, SkImage } from "@shopify/react-native-skia";

import { useFont, useImages } from "../../components/AssetProvider";

import type { ModeProps } from "./Canvas";
import { BaseCard } from "./BaseCard";

interface ActionProps extends ModeProps {
  path: string;
  label: string;
  x: number;
  mode: SkiaReadonlyValue<number>;
  emoji: SkImage;
}

const Action = ({ path, label, x, mode, emoji }: ActionProps) => {
  const font = useFont("DMSansMedium", 12);
  const pos = font.measureText(label);
  const matrix = useDerivedValue(() => OpacityMatrix(mode.current), [mode]);
  const opacity = useDerivedValue(() => 1 - mode.current, [mode]);
  return (
    <Group x={x}>
      <RoundedRect
        x={24.5}
        y={0}
        width={44}
        height={44}
        r={8}
        color="rgba(172, 172, 176, 0.24)"
      />
      <BaseCard
        baseColors={[
          "rgba(172, 172, 176, 0.24)",
          "rgba(172, 172, 176, 0.24)",
          "rgba(172, 172, 176, 0.24)",
        ]}
        rect={rrect(rect(24.5, 0, 44, 44), 8, 8)}
        mode={mode}
        y={0}
      />
      <Group>
        <Paint>
          <ColorMatrix matrix={matrix} />
        </Paint>
        <Image image={emoji} x={24.5 + 7} y={7} width={30} height={30} />
      </Group>
      <Group x={24.5 + (44 - 24) / 2} y={(44 - 24) / 2}>
        <Path
          path={path}
          style="stroke"
          strokeWidth={2}
          color="#1E1E20"
          strokeCap="round"
          strokeJoin="round"
          opacity={opacity}
        />
      </Group>
      <Text
        text={label}
        font={font}
        x={(93 - pos.width) / 2}
        y={48 + pos.height}
      />
    </Group>
  );
};

export const Actions = ({ mode }: ModeProps) => {
  const { rocket, cherries, money } = useImages();
  return (
    <Group y={350 + 24}>
      <Action
        x={24}
        path="M12 5V19M5 12H19"
        label="Add Card"
        mode={mode}
        emoji={rocket}
      />
      <Action
        x={133}
        path="M1 7H23M3 1H21C22.1046 1 23 1.89543 23 3V15C23 16.1046 22.1046 17 21 17H3C1.89543 17 1 16.1046 1 15V3C1 1.89543 1.89543 1 3 1Z"
        label="Transfer to card"
        mode={mode}
        emoji={cherries}
      />
      <Action
        x={242}
        path="M21 1L10 12M21 1L14 21L10 12M21 1L1 8L10 12"
        label="Send Money"
        mode={mode}
        emoji={money}
      />
    </Group>
  );
};
