import { Canvas, fitbox, Group, rect, Fill } from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

import { AssetProvider } from "../components/AssetProvider";

import { Topbar } from "./components/Topbar";
import { Card } from "./components/Card";
import { Actions } from "./components/Actions";
import { Modal } from "./components/Modal";
import { Tabbar } from "./components/Tabbar";
import { CANVAS } from "./components/Canvas";

const { width: w, height: h } = Dimensions.get("window");
const { width, height } = CANVAS;
const src = rect(0, 0, width, height);
const dst = rect(0, 0, w, h);
const tr = fitbox("fill", src, dst);
console.log({ tr });
export const Wallet = () => {
  return (
    <Canvas style={{ width: w, height: h }}>
      <AssetProvider
        typefaces={{
          DMSansRegular: require("../assets/DM_Sans/DMSans-Regular.ttf"),
          DMSansMedium: require("../assets/DM_Sans/DMSans-Medium.ttf"),
        }}
      >
        <Group transform={fitbox("contain", src, dst)}>
          <Fill color="#F6F6F6" />
          <Topbar />
          <Card />
          <Actions />
          <Modal />
          <Tabbar />
        </Group>
      </AssetProvider>
    </Canvas>
  );
};
