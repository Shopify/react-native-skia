import React, {useMemo, useRef} from 'react';
import {Button, Dimensions, StyleSheet, View} from 'react-native';
import type {IPath} from '@shopify/react-native-skia';
import {
  Skia,
  usePaint,
  useDrawCallback,
  PaintStyle,
  StrokeCap,
} from '@shopify/react-native-skia';

import {Section} from '../../Section';
import {ExampleProps} from '../types';
import {RNSkiaView} from '@shopify/react-native-skia/src/views';

const bgColor = Skia.Color('#7FC8A9');
const fgColor = Skia.Color('#7F33A9');

type Point = {x: number; y: number};

export const DrawingExample: React.FC<ExampleProps> = ({
  index,
  isVisible,
  onToggle,
}) => {
  const paint = usePaint(p => p.setColor(bgColor));
  const prevPointRef = useRef<Point>();

  const pathPaint = usePaint(p => {
    p.setColor(fgColor);
    p.setStrokeWidth(5);
    p.setStyle(PaintStyle.Stroke);
    p.setStrokeCap(StrokeCap.Round);
  });

  const paths = useMemo(() => [] as IPath[], []);
  const isDrawing = useRef<boolean>(false);

  const onDraw = useDrawCallback(
    (canvas, info) => {
      // Clear screen
      canvas.drawPaint(paint);

      // Handle touches
      const {touches} = info;
      if (isDrawing.current !== true && touches.length > 0) {
        // Begin
        isDrawing.current = true;
        // Create new path
        const path = Skia.Path();
        paths.push(path);
        path.moveTo(touches[0].x, touches[0].y);
        prevPointRef.current = {
          x: touches[0].x,
          y: touches[0].y,
        };
      } else if (isDrawing.current === true && touches.length > 0) {
        // Drawing
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
      } else if (isDrawing.current === true && touches.length === 0) {
        // Ended
        isDrawing.current = false;
      }

      // Draw paths
      if (paths.length > 0) {
        for (let i = 0; i < paths.length; i++) {
          canvas.drawPath(paths[i], pathPaint);
        }
      }
    },
    [paint, pathPaint, paths],
  );

  const skiaViewRef = useRef<RNSkiaView>(null);
  return (
    <Section
      title="Drawing Example"
      description="Touch to draw!"
      index={index}
      isVisible={isVisible}
      onToggle={onToggle}>
      <Skia.View ref={skiaViewRef} style={styles.skiaview} onDraw={onDraw} />
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
    </Section>
  );
};

const styles = StyleSheet.create({
  skiaview: {
    width: '100%',
    height: Dimensions.get('window').height * 0.45,
    borderRadius: 20,
    overflow: 'hidden',
  },
  buttons: {
    flexDirection: 'row',
  },
});
