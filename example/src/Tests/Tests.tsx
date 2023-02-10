/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SkiaDomView } from "@shopify/react-native-skia";
import { Group, Canvas, Skia } from "@shopify/react-native-skia";
import React, { useEffect, useRef, useState } from "react";
import { PixelRatio, Platform, Text, View } from "react-native";

import type { SerializedNode } from "./deserialize";
import { parseNode, parseProps } from "./deserialize";
import { useClient } from "./useClient";

export const CI = process.env.CI === "true";
const scale = 3 / PixelRatio.get();
const size = 256 * scale;
// Maximum time to draw: 250 on iOS, 500ms on Android, 1000ms on CI
// eslint-disable-next-line no-nested-ternary
const timeToDraw = CI ? 1500 : Platform.OS === "ios" ? 250 : 500;

interface TestsProps {
  assets: { [key: string]: any };
}

export const Tests = ({ assets }: TestsProps) => {
  const ref = useRef<SkiaDomView>(null);
  const client = useClient();
  const [drawing, setDrawing] = useState<any>(null);
  useEffect(() => {
    if (client !== null) {
      client.onmessage = (e) => {
        const tree: any = JSON.parse(e.data);
        if (tree.code) {
          client.send(
            JSON.stringify(
              // eslint-disable-next-line no-eval
              eval(
                `(function Main(){return (${tree.code})(this.Skia, this.ctx); })`
              ).call({
                Skia,
                ctx: parseProps(tree.ctx, assets),
              })
            )
          );
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
        const image = ref.current?.makeImageSnapshot();
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
  return (
    <View style={{ flex: 1 }}>
      <Text>
        {client === null ? "❤️" : "💚"} Waiting for the server to send tests
      </Text>
      <Canvas style={{ width: size, height: size }} ref={ref}>
        <Group transform={[{ scale }]}>{drawing}</Group>
      </Canvas>
    </View>
  );
};
