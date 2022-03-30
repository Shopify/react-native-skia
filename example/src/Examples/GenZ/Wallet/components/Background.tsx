import React from "react";
import type { SkiaReadonlyValue } from "@shopify/react-native-skia";
import {
  Skia,
  mixColors,
  Fill,
  useDerivedValue,
} from "@shopify/react-native-skia";

interface BackgroundProps {
  mode: SkiaReadonlyValue<number>;
}

export const Background = ({ mode }: BackgroundProps) => {
  const color = useDerivedValue(
    () => mixColors(mode.current, Skia.Color("#F6F6F6"), Skia.Color("black")),
    [mode]
  );
  return (
    <>
      <Fill color={color} />
    </>
  );
};
