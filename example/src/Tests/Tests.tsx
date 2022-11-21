import React, { useEffect } from "react";
import { Platform, Text } from "react-native";

export const ANDROID_WS_HOST = "10.0.2.2";
export const IOS_WS_HOST = "localhost";
const url = `ws://${
  Platform.OS === "android" ? ANDROID_WS_HOST : IOS_WS_HOST
}:4242`;

export const Tests = () => {
  const [client, setClient] = React.useState<WebSocket | null>(null);

  useEffect(() => {
    if (client === null) {
      const makeConnection = () => {
        console.log("waiting for connection...");
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
          }, 3000);
        };
      };
      makeConnection();
      let it: ReturnType<typeof setTimeout>;
      return () => {
        clearTimeout(it);
      };
    }
    client.onmessage = (e) => {
      const drawing: SerializedNode = JSON.parse(e.data);
      const node = parseNode(drawing);
      console.log(node);
    };
    return () => {
      client.close();
    };
  }, [client]);
  return <Text>💚 Waiting for the server to send tests</Text>;
};

interface SerializedProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface SerializedNode {
  type: string;
  props: SerializedProps;
  children: SerializedNode[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseNode = (serializedNode: SerializedNode): any => {
  const { type, props, children } = serializedNode;
  return React.createElement(type, props, children.map(parseNode));
};
