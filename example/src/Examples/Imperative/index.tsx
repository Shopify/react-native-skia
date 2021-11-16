import React, {useRef} from 'react';
import {Button, Dimensions, StyleSheet} from 'react-native';
import {
  Skia,
  usePaint,
  useDrawCallback,
  useFont,
} from '@shopify/react-native-skia';

import {Section} from '../../Section';
import {ExampleProps} from '../types';
import {RNSkiaView} from '@shopify/react-native-skia/src/views';

export const ImperativeExample: React.FC<ExampleProps> = ({
  index,
  isVisible,
  onToggle,
}) => {
  const paint = usePaint(p => p.setColor(Skia.Color('#7FC8A9')));
  const foregroundPaint = usePaint(p => p.setColor(Skia.Color('#7F33A9')));
  const font = useFont();

  const onDraw = useDrawCallback(
    (canvas, info) => {
      canvas.drawPaint(paint);
      canvas.drawText(info.timestamp.toString(), 10, 40, font, foregroundPaint);
    },
    [paint, foregroundPaint, font],
  );

  const ref = useRef<RNSkiaView>(null);

  return (
    <Section
      title="Imperative Drawing"
      description="Drawing with refs"
      index={index}
      isVisible={isVisible}
      onToggle={onToggle}>
      <Skia.View ref={ref} style={styles.skiaview} onDraw={onDraw} />
      <Button title={'Draw!'} onPress={() => ref.current?.redraw()} />
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
});
