import React, {useMemo} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import type {IPath} from '@shopify/react-native-skia';
import {
  Skia,
  usePaint,
  useDrawCallback,
  PaintStyle,
  StrokeCap,
} from '@shopify/react-native-skia';

import {Section} from '../../Section';

const bgColor = Skia.Color('#7FC8A9');
const fgColor = Skia.Color('#7F00A9');

export const DrawingExample: React.FC = () => {
  const paint = usePaint(p => p.setColor(bgColor));

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
          canvas.drawPath(paths[i]!, pathPaint);
        }
      }
    },
    [paint, pathPaint, paths],
  );

  return (
    <Section title="Drawing Example" description="Touch to draw!">
      <View
        onTouchStart={evt => {
          const path = Skia.Path();
          path.moveTo(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
          paths.push(path);
        }}
        onTouchMove={evt => {
          paths[paths.length - 1]?.lineTo(
            evt.nativeEvent.locationX,
            evt.nativeEvent.locationY,
          );
        }}>
        <Skia.View style={styles.skiaview} onDraw={onDraw} mode="continuous" />
      </View>
    </Section>
  );
};

const styles = StyleSheet.create({
  skiaview: {
    width: Dimensions.get('window').width * 0.85,
    height: Dimensions.get('window').height * 0.25,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
});
