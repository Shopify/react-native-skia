import type { SkiaReadonlyValue } from "@shopify/react-native-skia";
import { Group, Text } from "@shopify/react-native-skia";
import React from "react";

import { useFont } from "../../components/AssetProvider";

import { Switch } from "./Switch";
import { CANVAS } from "./Canvas";

const { width } = CANVAS;

interface TopbarProps {
  mode: SkiaReadonlyValue<number>;
}

export const Topbar = ({ mode }: TopbarProps) => {
  const text = "Wallet";
  const font = useFont("DMSansMedium", 24);
  const { height } = font.measureText(text);
  const x = 16;
  const y = 44 + 3;
  return (
    <Group y={y}>
      <Text text={text} font={font} x={x} y={height} color="#1E1E20" />
      <Group x={width - 16 - 48}>
        <Switch value={mode} />
      </Group>
    </Group>
  );
};
