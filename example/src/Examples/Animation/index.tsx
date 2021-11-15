import React from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import {
  Skia,
  usePaint,
  useDrawCallback,
  useFont,
} from '@shopify/react-native-skia';

import {Section} from '../../Section';
import {ExampleProps} from '../types';
import {Easing, interpolate, Extrapolate, normalize} from '../animation';

const bgColor = Skia.Color('#7FC8A9');
const fgColor = Skia.Color('#7F33A9');

const Size = 25;

export const AnimationExample: React.FC<ExampleProps> = ({
  index,
  isVisible,
  onToggle,
}) => {
  const paint = usePaint(p => p.setColor(bgColor));
  const foregroundPaint = usePaint(p => p.setColor(fgColor));
  const font = useFont();

  const onDraw = useDrawCallback(
    (canvas, info) => {
      canvas.drawPaint(paint);
      let t = normalize(info.timestamp, {duration: 2});
      t = Easing.inOut(t);
      const posX = interpolate(
        t,
        [0, 0.5, 1],
        [0, info.width - Size, 0],
        Extrapolate.CLAMP,
      );
      const posY = interpolate(
        t,
        [0, 0.5, 1],
        [0, info.height - Size, 0],
        Extrapolate.CLAMP,
      );
      canvas.drawCircle(posX, posY, Size, foregroundPaint);
    },
    [paint, foregroundPaint, font],
  );

  return (
    <Section
      title="Animation Example"
      description="Using animations with Skia"
      index={index}
      isVisible={isVisible}
      onToggle={onToggle}>
      <Skia.View style={styles.skiaview} onDraw={onDraw} mode="continuous" />
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
