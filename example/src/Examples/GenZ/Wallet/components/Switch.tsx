import React from "react";
import type { SkiaReadonlyValue } from "@shopify/react-native-skia";
import {
  mix,
  RoundedRect,
  Circle,
  useDerivedValue,
} from "@shopify/react-native-skia";

interface SwitchProps {
  value: SkiaReadonlyValue<number>;
}

export const Switch = ({ value }: SwitchProps) => {
  const cx = useDerivedValue(() => mix(value.current, 12, 36), [value]);
  return (
    <>
      <RoundedRect x={0} y={0} width={48} height={24} r={12} color="black" />
      <Circle cx={cx} cy={12} r={9} color="white" />
    </>
  );
};
