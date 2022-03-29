import { BackdropBlur, Fill, rect } from "@shopify/react-native-skia";
import React from "react";

import { CANVAS } from "./Canvas";

export const Tabbar = () => {
  return (
    <BackdropBlur blur={40} clip={rect(0, CANVAS.height - 100, 375, 100)}>
      <Fill color="rgba(252, 252, 252, 0.64)" />
    </BackdropBlur>
  );
};
