import { useEffect, useState } from "react";
import { Platform } from "react-native";

const DEFAULT_ANDROID_WS_HOST = "10.0.2.2";
const DEFAULT_IOS_WS_HOST = "localhost";
const DEFAULT_PORT = 4242;

type UseClient = [
  WebSocket | null,
  string,
  React.Dispatch<React.SetStateAction<string>>
];

export const useClient = (): UseClient => {
  const [hostname, setHostname] = useState<string>(
    Platform.OS === "android" ? DEFAULT_ANDROID_WS_HOST : DEFAULT_IOS_WS_HOST
  );

  const [client, setClient] = useState<WebSocket | null>(null);
  const [retry, setRetry] = useState<number>(0);

  useEffect(() => {
    const url = `ws://${hostname}:${DEFAULT_PORT}`;

    let it: ReturnType<typeof setTimeout>;
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
        // incrementing retry to rerun the effect
        setRetry((r) => r + 1);
      }, 500);
    };
    return () => {
      ws.close();
      clearTimeout(it);
    };
  }, [hostname, retry]);
  return [client, hostname, setHostname];
};
