import type { SkiaReadonlyValue } from "@shopify/react-native-skia";
import {
  interpolate,
  Text,
  Skia,
  useDerivedValue,
} from "@shopify/react-native-skia";
import React from "react";

import { graphs, AJUSTED_SIZE, WIDTH, HEIGHT, PADDING } from "../Model";

import type { GraphState } from "./Selection";

const tf = Skia.FontMgr.RefDefault().matchFamilyStyle("helvetica")!;
const titleFont = Skia.Font(tf, 64);
const subtitleFont = Skia.Font(tf, 24);

const currency = new Intl.NumberFormat("en-EN", {
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
  style: "currency",
  currency: "USD",
});

interface LabelProps {
  y: SkiaReadonlyValue<number>;
  state: SkiaReadonlyValue<GraphState>;
}

export const Label = ({ state, y }: LabelProps) => {
  const translateY = HEIGHT + PADDING;
  const text = useDerivedValue(() => {
    const graph = graphs[state.current.current];
    return currency.format(
      interpolate(
        y.current,
        [0, AJUSTED_SIZE],
        [graph.data.maxPrice, graph.data.minPrice]
      )
    );
  }, [y, state]);
  const subtitle = "+ $314,15";
  const titleX = useDerivedValue(() => {
    const graph = graphs[state.current.current];
    return (
      WIDTH / 2 -
      titleFont.measureText(currency.format(graph.data.maxPrice)).width / 2
    );
  }, [state]);
  const subtitlePos = subtitleFont.measureText(subtitle);
  return (
    <>
      <Text
        x={titleX}
        y={translateY - 120}
        text={text}
        font={titleFont}
        color="white"
      />
      <Text
        x={WIDTH / 2 - subtitlePos.width / 2}
        y={translateY - 60}
        text={subtitle}
        font={subtitleFont}
        color="#8E8E93"
      />
    </>
  );
};
