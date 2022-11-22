/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SkiaDomView } from "@shopify/react-native-skia";
import { Skia, Canvas } from "@shopify/react-native-skia";
import React, { useEffect, useRef, useState } from "react";
import { Platform, Text, View } from "react-native";

export const ANDROID_WS_HOST = "10.0.2.2";
export const IOS_WS_HOST = "localhost";
const url = `ws://${
  Platform.OS === "android" ? ANDROID_WS_HOST : IOS_WS_HOST
}:4242`;

export const Tests = () => {
  const ref = useRef<SkiaDomView>(null);
  const [client, setClient] = useState<WebSocket | null>(null);

  const [drawing, setDrawing] = useState<any>(null);
  useEffect(() => {
    if (client === null) {
      const makeConnection = () => {
        const ws = new WebSocket(url);
        ws.onopen = () => {
          setClient(ws);
        };
        ws.onclose = () => {
          setClient(null);
        };
        ws.onerror = () => {
          it = setTimeout(() => {
            ws.close();
            makeConnection();
          }, 500);
        };
      };
      makeConnection();
      let it: ReturnType<typeof setTimeout>;
      return () => {
        clearTimeout(it);
      };
    }
    client.onmessage = (e) => {
      const tree: SerializedNode = JSON.parse(e.data);
      const node = parseNode(tree);
      setDrawing(node);
    };
    return () => {
      client.close();
    };
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

interface SerializedProps {
  [key: string]: any;
}

interface SerializedNode {
  type: string;
  props: SerializedProps;
  children: SerializedNode[];
}

const parseNode = (serializedNode: SerializedNode): any => {
  const { type, props, children } = serializedNode;
  return React.createElement(
    type,
    { ...parseProps(props), key: `${Math.random()}` },
    children.map(parseNode)
  );
};

const parseProps = (props: SerializedProps) => {
  const newProps: SerializedProps = {};
  Object.keys(props).forEach((key) => {
    newProps[key] = parseProp(props[key]);
  });
  return newProps;
};

const parseProp = (value: any) => {
  if (value && typeof value === "object" && "__typename__" in value) {
    if (value.__typename__ === "Point") {
      return Skia.Point(value.x, value.y);
    }
  }
  return value;
};
