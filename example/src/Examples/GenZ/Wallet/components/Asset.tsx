import type { SkImage } from "@shopify/react-native-skia";
import {
  ImageShader,
  Paint,
  Group,
  Rect,
  Image,
  RoundedRect,
  Text,
} from "@shopify/react-native-skia";
import React from "react";

import { useFont } from "../../components/AssetProvider";

interface AssetProps {
  image: SkImage;
  title: string;
  subtitle: string;
  value: string;
  y: number;
  plus?: boolean;
}

export const Asset = ({
  title,
  subtitle,
  value,
  y,
  image,
  plus,
}: AssetProps) => {
  const valueFont = useFont("DMSansMedium", 16);
  const titleFont = useFont("DMSansMedium", 14);
  const subtitleFont = useFont("DMSansMedium", 12);
  const titlePos = titleFont.measureText(title);
  const subtitlePos = subtitleFont.measureText(subtitle);
  const valuePos = valueFont.measureText(value);
  return (
    <Group x={8} y={y}>
      <Group>
        <Paint>
          <ImageShader
            image={image}
            x={16}
            y={16}
            width={40}
            height={40}
            fit="contain"
          />
        </Paint>
        <RoundedRect x={16} y={16} width={40} height={40} r={12} />
      </Group>
      <Text
        text={title}
        x={72}
        y={16.5 + titlePos.height}
        font={titleFont}
        color="#1E1E20"
      />
      <Text
        text={subtitle}
        x={72}
        y={16.5 + 22 + subtitlePos.height}
        font={subtitleFont}
        color="rgba(172, 172, 176, 0.8)"
      />
      <Text
        text={value}
        x={286}
        y={25 + valuePos.height}
        font={valueFont}
        color={plus ? "#20BC56" : "#1A1B27"}
      />
    </Group>
  );
};
