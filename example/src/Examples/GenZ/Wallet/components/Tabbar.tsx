import { BackdropBlur, Fill, rect } from "@shopify/react-native-skia";
import React from "react";

export const Tabbar = () => {
  return (
    <BackdropBlur blur={40} clip={rect(0, 738, 375, 74)}>
      <Fill color="rgba(252, 252, 252, 0.64)" />
    </BackdropBlur>
  );
};
