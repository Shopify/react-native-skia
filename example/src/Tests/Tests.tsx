/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SkiaDomView } from "@shopify/react-native-skia";
import { Canvas } from "@shopify/react-native-skia";
import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";

import type { SerializedNode } from "./deserialize";
import { parseProps, parseNode } from "./deserialize";
import { useClient } from "./useClient";

export const Tests = () => {
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
              eval(`(function Main(){${tree.code}})`).call(parseProps(tree.ctx))
            )
          );
        } else {
          const node = parseNode(tree);
          setDrawing(node as SerializedNode);
        }
      };
      return () => {
        client.close();
      };
    }
    return;
  }, [client]);
  useEffect(() => {
    if (drawing) {
      const it = setTimeout(() => {
        const image = ref.current?.makeImageSnapshot();
        if (image && client) {
          const data = image.encodeToBytes();
          client.send(data);
        }
      }, 500);
      return () => {
        clearTimeout(it);
      };
    }
    return;
  }, [client, drawing]);
  return (
    <View style={{ flex: 1 }}>
      <Text>💚 Waiting for the server to send tests</Text>
      <Canvas style={{ width: 256, height: 256 }} ref={ref}>
        {drawing}
      </Canvas>
    </View>
  );
};
