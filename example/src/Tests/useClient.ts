import { useEffect, useState } from "react";
import { Platform } from "react-native";

const ANDROID_WS_HOST = "10.0.2.2";
const IOS_WS_HOST = "localhost";
const url = `ws://${
  Platform.OS === "android" ? ANDROID_WS_HOST : IOS_WS_HOST
}:4242`;

export const useClient = () => {
  const [client, setClient] = useState<WebSocket | null>(null);
  useEffect(() => {
    if (client === null) {
      const makeConnection = () => {
        const ws = new WebSocket(url);
        ws.onopen = () => {
          setClient(ws);
          ws.send(JSON.stringify({ OS: Platform.OS, arch: "paper" }));
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
    return;
  }, [client]);
  return client;
};
