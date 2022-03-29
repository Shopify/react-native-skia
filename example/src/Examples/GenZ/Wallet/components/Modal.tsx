import React from "react";
import { Group, RoundedRect, Text, Image } from "@shopify/react-native-skia";

import { useFont, useImages } from "../../components/AssetProvider";

import { CANVAS } from "./Canvas";
import { Asset } from "./Asset";
import { ActionCard } from "./ActionCard";

const { center } = CANVAS;

const Heading = () => {
  const text = "History";
  const font = useFont("DMSansMedium", 14);
  const pos = font.measureText(text);
  return (
    <Text text={text} x={24} y={28 + pos.height} font={font} color="#1E1E20" />
  );
};

export const Modal = () => {
  const images = useImages();
  const text = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
    new Date()
  );
  const font = useFont("DMSansMedium", 12);
  const pos = font.measureText(text);
  return (
    <Group y={463}>
      <RoundedRect x={8} y={0} height={750} width={359} color="white" r={24} />
      <RoundedRect
        x={163}
        y={16}
        width={33}
        height={4}
        r={99}
        color="rgba(172, 172, 176, 0.24)"
      />
      <Heading />
      <Text
        x={center.x - pos.width / 2}
        y={48 + pos.height}
        font={font}
        text={text}
        color="rgba(172, 172, 176, 0.8)"
      />
      <Asset
        title="EUR"
        subtitle="164.42"
        value="+0.12"
        y={64 + 17}
        image={images.EUR}
        plus
      />
      <Asset
        title="USD"
        subtitle="164.42"
        value="-0,81"
        y={64 + 89}
        image={images.USD}
      />
      <ActionCard y={64 + 161} />
    </Group>
  );
};
