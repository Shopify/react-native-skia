import { Canvas } from "@shopify/react-native-skia";
import React from "react";

import { Tabbar } from "./components/Tabbar";

export const Wallet = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Tabbar />
    </Canvas>
  );
};
