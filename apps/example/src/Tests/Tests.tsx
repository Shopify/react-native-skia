/* eslint-disable no-eval */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Canvas,
  Group,
  makeImageFromView,
  Skia,
  useCanvasRef,
} from "@shopify/react-native-skia";
import type { RefObject } from "react";
import React, { useEffect, useRef, useState } from "react";
import { PixelRatio, Text, View } from "react-native";

import type { SerializedNode } from "./deserialize";
import { parseNode, parseProps } from "./deserialize";
import { Screens } from "./Screens";
import { useClient } from "./useClient";

export const CI = process.env.CI === "true";
const s = 3;
const scale = s / PixelRatio.get();
const size = 256 * scale;
const timeToDraw = CI ? 1500 : 500;

interface TestsProps {
  assets: { [key: string]: any };
}

interface TestRequest {
  id: string;
  body: string;
}

interface TestResponse {
  id: string;
  data: string | ArrayBuffer;
  error?: string;
}

export const Tests = ({ assets }: TestsProps) => {
  const viewRef = useRef<View>(null);
  const ref = useCanvasRef();
  const [client, hostname] = useClient();
  const [drawing, setDrawing] = useState<any>(null);
  const [screen, setScreen] = useState<any>(null);
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);

  const sendResponse = (id: string, data: string | ArrayBuffer, error?: string) => {
    if (client) {
      const response: TestResponse = { id, data, error };
      client.send(JSON.stringify(response));
    }
  };

  useEffect(() => {
    if (client !== null) {
      client.onmessage = (e) => {
        try {
          const request: TestRequest = JSON.parse(e.data);
          const tree: any = JSON.parse(request.body);
          setCurrentRequestId(request.id);
          
          if (tree.code) {
            try {
              const result = eval(
                `(function Main() {
                  return (${tree.code})(this.Skia, this.ctx, this.size, this.scale);
                })`
              ).call({
                Skia,
                ctx: parseProps(tree.ctx, assets),
                size: size * PixelRatio.get(),
                scale: s,
              });
              sendResponse(request.id, JSON.stringify(result));
            } catch (error) {
              sendResponse(request.id, "", `Code execution error: ${error}`);
            }
          } else if (typeof tree.screen === "string") {
            const Screen = Screens[tree.screen];
            if (!Screen) {
              sendResponse(request.id, "", `Unknown screen: ${tree.screen}`);
              return;
            }
            setScreen(React.createElement(Screen));
          } else {
            try {
              const node = parseNode(tree, assets);
              setDrawing(node as SerializedNode);
            } catch (error) {
              sendResponse(request.id, "", `Node parsing error: ${error}`);
            }
          }
        } catch (error) {
          console.error("Error processing request:", error);
        }
      };
      return () => {
        client.close();
      };
    }
    return;
  }, [assets, client]);
  useEffect(() => {
    if (drawing && currentRequestId) {
      const requestId = currentRequestId;
      const it = setTimeout(() => {
        if (ref.current) {
          ref.current
            .makeImageSnapshotAsync({
              x: 0,
              y: 0,
              width: size,
              height: size,
            })
            .then((image) => {
              if (image && client) {
                const data = image.encodeToBytes();
                const base64Data = btoa(String.fromCharCode(...data));
                sendResponse(requestId, base64Data);
              }
            })
            .catch((e) => {
              sendResponse(requestId, "", `Drawing error: ${e}`);
            });
        }
      }, timeToDraw);
      return () => {
        clearTimeout(it);
      };
    }
    return;
  }, [client, drawing, ref, currentRequestId]);
  useEffect(() => {
    if (screen && currentRequestId) {
      const requestId = currentRequestId;
      const it = setTimeout(async () => {
        try {
          const image = await makeImageFromView(viewRef as RefObject<View>);
          if (image && client) {
            const data = image.encodeToBytes();
            const base64Data = btoa(String.fromCharCode(...data));
            sendResponse(requestId, base64Data);
          }
        } catch (e) {
          sendResponse(requestId, "", `Screen capture error: ${e}`);
        }
      }, timeToDraw);
      return () => {
        clearTimeout(it);
      };
    }
    return;
  }, [client, screen, currentRequestId]);
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Text style={{ color: "black" }}>
        {client === null
          ? `⚪️ Connecting to ${hostname}. Use yarn e2e to run tests.`
          : "🟢 Waiting for the server to send tests"}
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
