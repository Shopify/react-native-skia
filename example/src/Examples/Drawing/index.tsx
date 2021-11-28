import React, { useCallback, useMemo, useRef } from "react";
import { Button, StyleSheet, View } from "react-native";
import type { IPath, TouchInfo } from "@shopify/react-native-skia";
import {
  Skia,
  usePaint,
  useDrawCallback,
  PaintStyle,
  StrokeCap,
  SkiaView,
} from "@shopify/react-native-skia";
import { TouchType } from "@shopify/react-native-skia/src/views";

type Point = { x: number; y: number };

export const DrawingExample: React.FC = () => {
  const paint = usePaint((p) => p.setColor(Skia.Color("#7FC8A9")));
  const prevPointRef = useRef<Point>();

  const pathPaint = usePaint((p) => {
    p.setColor(Skia.Color("#7F33A9"));
    p.setStrokeWidth(5);
    p.setStyle(PaintStyle.Stroke);
    p.setStrokeCap(StrokeCap.Round);
  });

  const paths = useMemo(() => [] as IPath[], []);

  const handleTouches = useCallback(
    (toucheOps: Array<Array<TouchInfo>>) => {
      // Handle touches
      if (toucheOps.length === 0) {
        return;
      }
      toucheOps.forEach((touches) => {
        if (touches.length > 0) {
          switch (touches[0].type) {
            case TouchType.Start: {
              // Create new path
              const path = Skia.Path.Make();
              paths.push(path);
              path.moveTo(touches[0].x, touches[0].y);
              prevPointRef.current = {
                x: touches[0].x,
                y: touches[0].y,
              };
              break;
            }
            case TouchType.Active:
            case TouchType.End:
            case TouchType.Cancelled: {
              // Get current path object
              const path = paths[paths.length - 1];

              // Get current position
              const { x } = touches[0];
              const { y } = touches[0];

              // Calculate and draw a smooth curve
              const xMid = (prevPointRef.current!.x + x) / 2;
              const yMid = (prevPointRef.current!.y + y) / 2;

              path.quadTo(
                prevPointRef.current!.x,
                prevPointRef.current!.y,
                xMid,
                yMid
              );

              prevPointRef.current = { x, y };
              break;
            }
          }
        }
      });
    },
    [paths]
  );

  const onDraw = useDrawCallback(
    (canvas, info) => {
      // Clear screen
      canvas.drawPaint(paint);

      // Update from pending touches
      handleTouches(info.touches);

      // Draw paths
      if (paths.length > 0) {
        for (let i = 0; i < paths.length; i++) {
          canvas.drawPath(paths[i], pathPaint);
        }
      }
    },
    [paint, pathPaint, paths]
  );

  const skiaViewRef = useRef<SkiaView>(null);

  return (
    <>
      <SkiaView
        ref={skiaViewRef}
        style={styles.skiaview}
        onDraw={onDraw}
        debug
      />
      <View style={styles.buttons}>
        <Button
          title="Clear"
          onPress={() => {
            paths.length = 0;
            skiaViewRef.current?.redraw();
          }}
        />
        <Button
          title="Undo"
          onPress={() => {
            paths.length = Math.max(0, paths.length - 1);
            skiaViewRef.current?.redraw();
          }}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  skiaview: {
    width: "100%",
    flex: 1,
    overflow: "hidden",
  },
  buttons: {
    flexDirection: "row",
    paddingBottom: 24,
    paddingHorizontal: 14,
  },
});
