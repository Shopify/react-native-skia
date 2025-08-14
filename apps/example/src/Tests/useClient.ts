import { useEffect, useState } from "react";
import { Platform } from "react-native";

const { OS } = Platform;
const ANDROID_WS_HOST = "10.0.2.2";
const IOS_WS_HOST = "localhost";
const HOST = OS === "android" ? ANDROID_WS_HOST : IOS_WS_HOST;
const PORT = 4242;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const arch = (global as any)?.nativeFabricUIManager ? "fabric" : "paper";

type ConnectionState = "connecting" | "connected" | "disconnected" | "error";
type UseClient = [
  client: WebSocket | null,
  hostname: string,
  state: ConnectionState
];

export const useClient = (): UseClient => {
  const [client, setClient] = useState<WebSocket | null>(null);
  const [state, setState] = useState<ConnectionState>("connecting");
  const [retry, setRetry] = useState<number>(0);
  const [messageQueue, setMessageQueue] = useState<string[]>([]);

  useEffect(() => {
    const url = `ws://${HOST}:${PORT}`;
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let heartbeatInterval: ReturnType<typeof setInterval>;

    setState("connecting");
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setState("connected");
      setClient(ws);

      // Send initial handshake
      ws.send(
        JSON.stringify({
          OS,
          arch,
        })
      );

      // Send any queued messages
      messageQueue.forEach((message) => {
        ws.send(message);
      });
      setMessageQueue([]);

      // Start heartbeat
      heartbeatInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 30000);
    };

    ws.onclose = (event) => {
      console.log("WebSocket closed:", event.code, event.reason);
      setState("disconnected");
      setClient(null);
      clearInterval(heartbeatInterval);

      // Attempt to reconnect after delay
      if (retry < 10) {
        // Max 10 retries
        const delay = Math.min(1000 * Math.pow(2, retry), 10000); // Exponential backoff, max 10s
        console.log(`Reconnecting in ${delay}ms...`);
        reconnectTimeout = setTimeout(() => {
          setRetry((r) => r + 1);
        }, delay);
      } else {
        setState("error");
        console.error("Max reconnection attempts reached");
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setState("error");
    };

    // Override the send method to queue messages when not connected
    const originalSend = ws.send.bind(ws);
    ws.send = (data: string | ArrayBufferLike | Blob | ArrayBufferView) => {
      if (ws.readyState === WebSocket.OPEN) {
        originalSend(data);
      } else {
        // Queue message for later
        if (typeof data === "string") {
          setMessageQueue((queue) => [...queue, data]);
        }
      }
    };

    return () => {
      clearTimeout(reconnectTimeout);
      clearInterval(heartbeatInterval);
      ws.close(1000, "Component unmounting");
    };
  }, [retry, messageQueue]);

  return [client, HOST, state];
};
