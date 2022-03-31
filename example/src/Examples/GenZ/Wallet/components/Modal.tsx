import React from "react";
import type { SkiaReadonlyValue } from "@shopify/react-native-skia";
import {
  Group,
  mixColors,
  RoundedRect,
  Skia,
  Text,
  useDerivedValue,
} from "@shopify/react-native-skia";

import { useFont, useImages } from "../../components/AssetProvider";

import type { ModeProps } from "./Canvas";
import { CANVAS } from "./Canvas";
import { Asset } from "./Asset";
import { ActionCard } from "./ActionCard";

const { center } = CANVAS;

const Heading = ({ mode }: ModeProps) => {
  const text = "History";
  const font = useFont("DMSansMedium", 14);
  const pos = font.measureText(text);
  const color = useDerivedValue(
    () => mixColors(mode.current, Skia.Color("#1E1E20"), Skia.Color("white")),
    [mode]
  );
  return (
    <Text text={text} x={24} y={28 + pos.height} font={font} color={color} />
  );
};

interface ModalProps {
  mode: SkiaReadonlyValue<number>;
}

export const Modal = ({ mode }: ModalProps) => {
  const images = useImages();
  const text = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    new Date()
  );
  const font = useFont("DMSansMedium", 12);
  const pos = font.measureText(text);
  const color = useDerivedValue(
    () => mixColors(mode.current, Skia.Color("white"), Skia.Color("#1F1F1F")),
    [mode]
  );
  return (
    <Group y={463}>
      <RoundedRect x={8} y={0} height={750} width={359} color={color} r={24} />
      <RoundedRect
        x={163}
        y={16}
        width={33}
        height={4}
        r={99}
        color="rgba(172, 172, 176, 0.24)"
      />
      <Heading mode={mode} />
      <Text
        x={center.x - pos.width / 2}
        y={48 + pos.height}
        font={font}
        text={text}
        color="rgba(172, 172, 176, 0.8)"
      />
      <Asset
        title="EUR"
        title2="Ethereum"
        subtitle="164.42"
        value="+0.12"
        y={64 + 17}
        image1={images.EUR}
        image2={images.ETH}
        mode={mode}
        plus
      />
      <Asset
        title="USD"
        title2="Bitcoin"
        subtitle="164.42"
        value="-0,81"
        y={64 + 89}
        image1={images.USD}
        image2={images.BTC}
        mode={mode}
      />
      <ActionCard y={64 + 161} mode={mode} />
    </Group>
  );
};
