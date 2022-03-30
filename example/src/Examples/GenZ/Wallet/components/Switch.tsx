import React from "react";
import { RoundedRect, Circle } from "@shopify/react-native-skia";

export const Switch = () => {
  return (
    <>
      <RoundedRect x={0} y={0} width={48} height={24} r={12} color="black" />
      <Circle cx={12} cy={12} r={9} color="white" />
    </>
  );
};
