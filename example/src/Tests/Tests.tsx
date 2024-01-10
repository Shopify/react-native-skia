/* eslint-disable no-eval */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SkiaDomView } from "@shopify/react-native-skia";
import {
  Group,
  Canvas,
  Skia,
  makeImageFromView,
} from "@shopify/react-native-skia";
import React, { useEffect, useRef, useState } from "react";
import { PixelRatio, Platform, Text, View } from "react-native";

import type { SerializedNode } from "./deserialize";
import { parseNode, parseProps } from "./deserialize";
import { useClient } from "./useClient";
import { Screens } from "./Screens";

export const CI = process.env.CI === "true";
const s = 3;
const scale = s / PixelRatio.get();
const size = 256 * scale;
// Maximum time to draw: 250 on iOS, 500ms on Android, 1000ms on CI
// eslint-disable-next-line no-nested-ternary
const timeToDraw = CI ? 1500 : Platform.OS === "ios" ? 250 : 500;

interface TestsProps {
  assets: { [key: string]: any };
}

export const Tests = ({ assets }: TestsProps) => {
  const viewRef = useRef<View>(null);
  const ref = useRef<SkiaDomView>(null);
  const client = useClient();
  const [drawing, setDrawing] = useState<any>(null);
  const [screen, setScreen] = useState<any>(null);
  useEffect(() => {
    if (client !== null) {
      client.onmessage = (e) => {
        const tree: any = JSON.parse(e.data);
        if (tree.code) {
          client.send(
            JSON.stringify(
              eval(
                `(function Main(){return (${tree.code})(this.Skia, this.ctx, this.size, this.scale); })`
              ).call({
                Skia,
                ctx: parseProps(tree.ctx, assets),
                size: size * PixelRatio.get(),
                scale: s,
              })
            )
          );
        } else if (typeof tree.screen === "string") {
          const Screen = Screens[tree.screen];
          if (!Screen) {
            throw new Error(`Unknown screen: ${tree.screen}`);
          }
          setScreen(React.createElement(Screen));
        } else {
          const node = parseNode(tree, assets);
          setDrawing(node as SerializedNode);
        }
      };
      return () => {
        client.close();
      };
    }
    return;
  }, [assets, client]);
  useEffect(() => {
    if (drawing) {
      const it = setTimeout(() => {
        const image = ref.current?.makeImageSnapshot({
          x: 0,
          y: 0,
          width: size,
          height: size,
        });
        if (image && client) {
          const data = image.encodeToBytes();
          client.send(data);
        }
      }, timeToDraw);
      return () => {
        clearTimeout(it);
      };
    }
    return;
  }, [client, drawing]);
  useEffect(() => {
    if (screen) {
      const it = setTimeout(async () => {
        const image = await makeImageFromView(viewRef);
        if (image && client) {
          const data = image.encodeToBytes();
          client.send(data);
        }
      }, timeToDraw);
      return () => {
        clearTimeout(it);
      };
    }
    return;
  }, [client, screen]);
  return (
    <View style={{ flex: 1 }}>
      <Text>
        {client === null ? "⚪️" : "🟢"} Waiting for the server to send tests
      </Text>
      <Canvas style={{ width: size, height: size }} ref={ref}>
        <Group transform={[{ scale }]}>{drawing}</Group>
      </Canvas>
      <View
        style={{ width: size, height: size }}
        ref={viewRef}
        collapsable={false}
      >
        {screen}
      </View>
    </View>
  );
};
