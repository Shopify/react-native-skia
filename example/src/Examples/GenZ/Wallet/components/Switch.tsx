import React from "react";
import type { SkiaReadonlyValue } from "@shopify/react-native-skia";
import {
  Paint,
  ColorMatrix,
  OpacityMatrix,
  Group,
  Image,
  rect,
  rrect,
  mix,
  RoundedRect,
  Circle,
  useDerivedValue,
} from "@shopify/react-native-skia";

import { useImages } from "../../components/AssetProvider";

import { BaseCard } from "./BaseCard";

const size = 14;

interface SwitchProps {
  value: SkiaReadonlyValue<number>;
}

export const Switch = ({ value }: SwitchProps) => {
  const { star } = useImages();
  const cx = useDerivedValue(() => mix(value.current, 12, 36), [value]);
  const x = useDerivedValue(
    () => mix(value.current, 12 - size / 2, 36 - size / 2),
    [value]
  );
  const opacity = useDerivedValue(() => mix(value.current, 1, 0.5), [value]);
  const matrix = useDerivedValue(() => OpacityMatrix(value.current), [value]);
  return (
    <>
      <RoundedRect x={0} y={0} width={48} height={24} r={12} color="black" />
      <BaseCard
        y={0}
        rect={rrect(rect(0, 0, 48, 24), 12, 12)}
        mode={value}
        baseColors={["black", "black", "black"]}
      />
      <Circle cx={cx} cy={12} r={9} color="white" opacity={opacity} />
      <Group>
        <Paint>
          <ColorMatrix matrix={matrix} />
        </Paint>
        <Image
          x={x}
          y={12 - size / 2}
          image={star}
          width={size}
          height={size}
          fit="contain"
        />
      </Group>
    </>
  );
};
