import React, {useMemo, useRef} from 'react';
import {Button, StyleSheet, View} from 'react-native';
import type {Path} from '@shopify/react-native-skia';
import {
  Skia,
  useTouchCallback,
  usePaint,
  useDrawCallback,
  PaintStyle,
  StrokeCap,
  SkiaView,
} from '@shopify/react-native-skia';
import {TouchType} from '@shopify/react-native-skia/src/views';

type Point = {x: number; y: number};

export const DrawingExample: React.FC = () => {
  const paint = usePaint(p => p.setColor(Skia.Color('#7FC8A9')));
  const prevPointRef = useRef<Point>();

  const pathPaint = usePaint(p => {
    p.setColor(Skia.Color('#7F33A9'));
    p.setStrokeWidth(5);
    p.setStyle(PaintStyle.Stroke);
    p.setStrokeCap(StrokeCap.Round);
  });

  const paths = useMemo(() => [] as Path[], []);
  const isDrawing = useRef<boolean>(false);

  const onTouch = useTouchCallback(
    touches => {
      // Handle touches
      if (touches.length === 0) {
        return;
      }

      if (isDrawing.current !== true) {
        // Begin
        isDrawing.current = true;
        // Create new path
        const path = Skia.Path.Make();
        paths.push(path);
        path.moveTo(touches[0].x, touches[0].y);
        prevPointRef.current = {
          x: touches[0].x,
          y: touches[0].y,
        };
      } else if (isDrawing.current === true) {
        console.log(touches[0].force);
        // Get current path object
        const path = paths[paths.length - 1];

        // Get current position
        const x = touches[0].x;
        const y = touches[0].y;

        // Calculate and draw a smooth curve
        const x_mid = (prevPointRef.current!.x + x) / 2;
        const y_mid = (prevPointRef.current!.y + y) / 2;

        path.quadTo(
          prevPointRef.current!.x,
          prevPointRef.current!.y,
          x_mid,
          y_mid,
        );

        prevPointRef.current = {x, y};

        // Test if we should end
        if (touches[0].type === TouchType.End) {
          // Ended
          isDrawing.current = false;
          return;
        }
      }
    },
    [paths],
  );

  const onDraw = useDrawCallback(
    canvas => {
      // Clear screen
      canvas.drawPaint(paint);

      // Draw paths
      if (paths.length > 0) {
        for (let i = 0; i < paths.length; i++) {
          canvas.drawPath(paths[i], pathPaint);
        }
      }
    },
    [paint, pathPaint, paths],
  );

  const skiaViewRef = useRef<SkiaView>(null);

  return (
    <>
      <SkiaView
        ref={skiaViewRef}
        style={styles.skiaview}
        onDraw={onDraw}
        onTouch={onTouch}
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
    width: '100%',
    flex: 1,
    overflow: 'hidden',
  },
  buttons: {
    flexDirection: 'row',
    paddingBottom: 24,
    paddingHorizontal: 14,
  },
});
