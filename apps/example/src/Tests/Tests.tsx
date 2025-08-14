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
    if (client !== null && client.connected) {
      
      // Handle eval requests (code execution)
      client.on('eval-request', (data, callback) => {
        try {
          const result = eval(
            `(function Main() {
              return (${data.code})(this.Skia, this.ctx, this.size, this.scale);
            })`
          ).call({
            Skia,
            ctx: parseProps(data.ctx, assets),
            size: size * PixelRatio.get(),
            scale: s,
          });
          callback(result);
        } catch (error: any) {
          console.error("Failed to process eval request:", error);
          callback({ error: error.message });
        }
      });

      // Handle draw requests (rendering nodes)
      client.on('draw-request', (tree, callback) => {
        try {
          const node = parseNode(tree, assets);
          setDrawing({ node: node as SerializedNode, callback });
        } catch (error: any) {
          console.error("Failed to process draw request:", error);
          callback({ error: error.message });
        }
      });

      // Handle screen requests (taking screenshots)
      client.on('screen-request', (data, callback) => {
        try {
          const Screen = Screens[data.screen];
          if (!Screen) {
            throw new Error(`Unknown screen: ${data.screen}`);
          }
          setScreen({ component: React.createElement(Screen), callback });
        } catch (error: any) {
          console.error("Failed to process screen request:", error);
          callback({ error: error.message });
        }
      });

      return () => {
        client.off('eval-request');
        client.off('draw-request'); 
        client.off('screen-request');
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
              if (image) {
                const data = image.encodeToBytes();
                if (drawing.callback) {
                  // Socket.IO callback response
                  drawing.callback(Array.from(data));
                }
              }
            })
            .catch((e) => {
              console.error(e);
              if (drawing.callback) {
                drawing.callback({ error: e.message });
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
          if (image) {
            const data = image.encodeToBytes();
            if (screen.callback) {
              // Socket.IO callback response
              screen.callback(Array.from(data));
            }
          }
        } catch (e: any) {
          console.error(e);
          if (screen.callback) {
            screen.callback({ error: e.message });
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
