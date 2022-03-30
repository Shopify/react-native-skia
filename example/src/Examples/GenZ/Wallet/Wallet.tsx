import {
  Canvas,
  fitbox,
  Group,
  rect,
  Circle,
  useValue,
  useTouchHandler,
  runTiming,
  useDerivedValue,
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
import { Graph } from "./components/Graph";
import { Background } from "./components/Background";

const { width: w, height: h } = Dimensions.get("window");
const { width, height } = CANVAS;
const src = rect(0, 0, width, height);
const dst = rect(0, 0, w, h);
const transform = fitbox("cover", src, dst);
//const pagination = rect(0, 340, width, 21);

// const isInRect = (pt: Vector, { x, y, width: w1, height: h1 }: SkRect) =>
//   pt.x >= x && pt.x <= x + w1 && pt.y >= y && pt.y <= y + h1;

export const Wallet = () => {
  const mode = useValue(0);
  const translateX = useValue(0);
  const tr = useDerivedValue(
    () => [{ translateX: translateX.current }],
    [translateX]
  );
  const onTouch = useTouchHandler({
    onEnd: (pt) => {
      if (pt.y < 200 * transform[3].scaleY) {
        runTiming(mode, mode.current === 1 ? 0 : 1, { duration: 450 });
      } else if (pt.y > 346 * transform[3].scaleY) {
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
          <Background mode={mode} />
          <Topbar mode={mode} />
          <Group transform={tr}>
            <Card mode={mode} />
            <Group transform={[{ translateX: width }]}>
              <Graph />
            </Group>
          </Group>
          <Circle cx={176} cy={346} r={4} color="#828282" />
          <Circle cx={191} cy={346} r={4} color="#BDBDBD" />
          <Actions mode={mode} />
          <Modal mode={mode} />
          <Tabbar />
        </Group>
      </AssetProvider>
    </Canvas>
  );
};
