import type { Vector, SkRect } from "@shopify/react-native-skia";
import {
  Canvas,
  fitbox,
  Group,
  rect,
  Fill,
  Circle,
  useValue,
  useTouchHandler,
  runTiming,
  useDerivedValue,
  Rect,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

import { AssetProvider } from "../components/AssetProvider";

import { Topbar } from "./components/Topbar";
import { Card } from "./components/Card";
import { Actions } from "./components/Actions";
import { Modal } from "./components/Modal";
import { Tabbar } from "./components/Tabbar";
import { CANVAS, Images, Typefaces } from "./components/Canvas";

const { width: w, height: h } = Dimensions.get("window");
const { width, height } = CANVAS;
const src = rect(0, 0, width, height);
const dst = rect(0, 0, w, h);
const transform = fitbox("cover", src, dst);
const pagination = rect(0, 340, width, 21);

const isInRect = (pt: Vector, { x, y, width: w1, height: h1 }: SkRect) =>
  pt.x >= x && pt.x <= x + w1 && pt.y >= y && pt.y <= y + h1;

export const Wallet = () => {
  const translateX = useValue(0);
  const tr = useDerivedValue(
    () => [{ translateX: translateX.current }],
    [translateX]
  );
  const onTouch = useTouchHandler({
    onStart: (pt) => {
      if (isInRect(pt, pagination)) {
        runTiming(translateX, translateX.current !== 0 ? 0 : -width, {
          duration: 600,
        });
      }
    },
  });
  return (
    <Canvas style={{ width: w, height: h }} onTouch={onTouch}>
      <AssetProvider typefaces={Typefaces} images={Images}>
        <Group transform={transform}>
          <Fill color="#F6F6F6" />
          <Topbar />
          <Group transform={tr}>
            <Card />
          </Group>
          <Circle cx={176} cy={346} r={4} color="#828282" />
          <Circle cx={191} cy={346} r={4} color="#BDBDBD" />
          <Actions />
          <Modal />
          <Tabbar />
        </Group>
        <Rect rect={pagination} color="red" />
      </AssetProvider>
    </Canvas>
  );
};
