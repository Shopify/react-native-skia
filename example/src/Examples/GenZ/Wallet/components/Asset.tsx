import type { SkImage } from "@shopify/react-native-skia";
import {
  ImageShader,
  Paint,
  Group,
  Rect,
  Image,
  RoundedRect,
} from "@shopify/react-native-skia";
import React from "react";

interface AssetProps {
  image: SkImage;
  title: string;
  subtitle: string;
  value: number;
  y: number;
}

export const Asset = ({
  children,
  title,
  subtitle,
  value,
  y,
  image,
}: AssetProps) => {
  return (
    <Group x={8} y={y}>
      <Rect x={0} y={0} width={359} height={72} color="blue" />
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
    </Group>
  );
};
