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

export const Tests = ({ assets }: TestsProps) => {
  const viewRef = useRef<View>(null);
  const ref = useCanvasRef();
  const [client, hostname, connectionState] = useClient();
  const [drawing, setDrawing] = useState<any>(null);
  const [screen, setScreen] = useState<any>(null);
  useEffect(() => {
    if (client !== null) {
      client.onmessage = (e) => {
        try {
          const message = JSON.parse(e.data);
          let requestId: string | undefined;
          let tree: any;

          // Handle ping/pong for heartbeat
          if (message.type === 'pong') {
            // Heartbeat response received, connection is alive
            return;
          }
          
          // Check if this is a correlated message
          if (message.id && message.body) {
            requestId = message.id;
            tree = message.body;
          } else {
            // Legacy message format
            tree = message;
          }

          const sendResponse = (data: any) => {
            if (requestId) {
              // Send correlated response
              const response = JSON.stringify({
                id: requestId,
                body: data
              });
              client.send(response);
            } else {
              // Legacy response
              client.send(data);
            }
          };

          if (tree.code) {
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
            sendResponse(JSON.stringify(result));
          } else if (typeof tree.screen === "string") {
            const Screen = Screens[tree.screen];
            if (!Screen) {
              throw new Error(`Unknown screen: ${tree.screen}`);
            }
            setScreen({ component: React.createElement(Screen), requestId });
          } else {
            const node = parseNode(tree, assets);
            setDrawing({ node: node as SerializedNode, requestId });
          }
        } catch (error) {
          console.error("Failed to process message:", error);
          // Send error response if we have a request ID
          const errorResponse = { error: error.message };
          client.send(JSON.stringify(errorResponse));
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
                if (drawing.requestId) {
                  // Send correlated response
                  const response = JSON.stringify({
                    id: drawing.requestId,
                    body: Array.from(data)
                  });
                  client.send(response);
                } else {
                  // Legacy response
                  client.send(data);
                }
              }
            })
            .catch((e) => {
              console.error(e);
              if (drawing.requestId && client) {
                const errorResponse = JSON.stringify({
                  id: drawing.requestId,
                  error: e.message
                });
                client.send(errorResponse);
              }
            });
        }
      }, timeToDraw);
      return () => {
        clearTimeout(it);
      };
    }
    return;
  }, [client, drawing, ref]);
  useEffect(() => {
    if (screen) {
      const it = setTimeout(async () => {
        try {
          const image = await makeImageFromView(viewRef as RefObject<View>);
          if (image && client) {
            const data = image.encodeToBytes();
            if (screen.requestId) {
              // Send correlated response
              const response = JSON.stringify({
                id: screen.requestId,
                body: Array.from(data)
              });
              client.send(response);
            } else {
              // Legacy response
              client.send(data);
            }
          }
        } catch (e) {
          console.error(e);
          if (screen.requestId && client) {
            const errorResponse = JSON.stringify({
              id: screen.requestId,
              error: e.message
            });
            client.send(errorResponse);
          }
        }
      }, timeToDraw);
      return () => {
        clearTimeout(it);
      };
    }
    return;
  }, [client, screen]);
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Text style={{ color: "black" }}>
        {(() => {
          switch (connectionState) {
            case 'connecting':
              return `⚪️ Connecting to ${hostname}. Use yarn e2e to run tests.`;
            case 'connected':
              return "🟢 Connected - Waiting for the server to send tests";
            case 'disconnected':
              return `🟡 Disconnected from ${hostname} - Reconnecting...`;
            case 'error':
              return `🔴 Connection failed to ${hostname}`;
            default:
              return `⚪️ Connecting to ${hostname}. Use yarn e2e to run tests.`;
          }
        })()}
      </Text>
      <Canvas style={{ width: size, height: size }} ref={ref}>
        <Group transform={[{ scale }]}>{drawing?.node || drawing}</Group>
      </Canvas>
      <View
        style={{ width: size, height: size }}
        ref={viewRef}
        collapsable={false}
      >
        {screen?.component || screen}
      </View>
    </View>
  );
};
