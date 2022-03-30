import type { SkImage } from "@shopify/react-native-skia";
import {
  OpacityMatrix,
  ColorMatrix,
  Skia,
  useDerivedValue,
  ImageShader,
  Paint,
  Group,
  RoundedRect,
  Text,
  // useDerivedValue,
  mixColors,
} from "@shopify/react-native-skia";
import React from "react";

import { useFont } from "../../components/AssetProvider";

import type { ModeProps } from "./Canvas";

// const source = Skia.RuntimeEffect.Make(`
// uniform shader image1;
// uniform shader image2;
// uniform float progress;

// half4 main(float2 xy) {
//   return vec4(image1.eval(xy).rgb, 1.0);
//   //return vec4(mix(vec3(progress), image1.eval(xy).rgb, image2.eval(xy).rgb), 1.0);
// }`)!;

interface AssetProps extends ModeProps {
  image1: SkImage;
  image2: SkImage;
  title: string;
  title2: string;
  subtitle: string;
  value: string;
  y: number;
  plus?: boolean;
}

export const Asset = ({
  title,
  title2,
  subtitle,
  value,
  y,
  image1,
  image2,
  mode,
  plus,
}: AssetProps) => {
  const valueFont = useFont("DMSansMedium", 16);
  const titleFont = useFont("DMSansMedium", 14);
  const subtitleFont = useFont("DMSansMedium", 12);
  const titlePos = titleFont.measureText(title);
  const title2Pos = titleFont.measureText(title2);
  const subtitlePos = subtitleFont.measureText(subtitle);
  const valuePos = valueFont.measureText(value);
  const matrix = useDerivedValue(() => OpacityMatrix(1 - mode.current), [mode]);
  const color = useDerivedValue(
    () => mixColors(mode.current, Skia.Color("#1A1B27"), Skia.Color("#EB001B")),
    [mode]
  );
  return (
    <Group x={8} y={y}>
      <Group>
        <Paint>
          <ImageShader
            image={image2}
            x={16}
            y={16}
            width={40}
            height={40}
            fit="contain"
          />
        </Paint>
        <RoundedRect x={16} y={16} width={40} height={40} r={12} />
      </Group>
      <Group>
        <Paint>
          <ImageShader
            image={image1}
            x={16}
            y={16}
            width={40}
            height={40}
            fit="contain"
          />
          <ColorMatrix matrix={matrix} />
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
        text={title2}
        x={72}
        y={16.5 + title2Pos.height}
        font={titleFont}
        color="white"
        opacity={mode}
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
        color={plus ? "#20BC56" : color}
      />
    </Group>
  );
};
