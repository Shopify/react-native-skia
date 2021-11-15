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

  const onDraw = useDrawCallback(
    canvas => {
      canvas.drawPaint(paint);
      if (paths.length > 0) {
        for (let i = 0; i < paths.length; i++) {
          canvas.drawPath(paths[i], pathPaint);
        }
      }
    },
    [paint, pathPaint, paths],
  );

  return (
    <Section
      title="Drawing Example"
      description="Touch to draw!"
      index={index}
      isVisible={isVisible}
      onToggle={onToggle}>
      <View
        onTouchStart={evt => {
          const path = Skia.Path();
          paths.push(path);
          path.moveTo(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
          prevPointRef.current = {
            x: evt.nativeEvent.locationX,
            y: evt.nativeEvent.locationY,
          };
        }}
        onTouchMove={evt => {
          if (prevPointRef.current === undefined) {
            return;
          }
          const path = paths[paths.length - 1];

          const x = evt.nativeEvent.locationX;
          const y = evt.nativeEvent.locationY;

          const x_mid = (prevPointRef.current.x + x) / 2;
          const y_mid = (prevPointRef.current.y + y) / 2;

          path.quadTo(
            prevPointRef.current.x,
            prevPointRef.current.y,
            x_mid,
            y_mid,
          );

          prevPointRef.current = {x, y};
        }}>
        <Skia.View style={styles.skiaview} onDraw={onDraw} mode="continuous" />
        <Button title="clear" onPress={() => (paths.length = 0)} />
      </View>
    </Section>
  );
};

const styles = StyleSheet.create({
  skiaview: {
    width: Dimensions.get('window').width * 0.85,
    height: Dimensions.get('window').height * 0.45,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
});
