import { Canvas, FitBox, rect } from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

import { AssetProvider } from "../components/AssetProvider";

import { Topbar } from "./components/Topbar";

const { width: w, height: h } = Dimensions.get("window");
const width = 375;
const height = 812;
const src = rect(0, 0, width, height);
const dst = rect(0, 0, w, h);

export const Wallet = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <AssetProvider
        typefaces={{
          DMSansRegular: require("../assets/DM_Sans/DMSans-Regular.ttf"),
          DMSansMedium: require("../assets/DM_Sans/DMSans-Medium.ttf"),
        }}
      >
        <FitBox src={src} dst={dst}>
          <Topbar />
        </FitBox>
      </AssetProvider>
    </Canvas>
  );
};
