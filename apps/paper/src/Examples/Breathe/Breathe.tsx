import React, { useEffect, useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import type { SkImage } from "@shopify/react-native-skia";
import {
  BlurMask,
  vec,
  Canvas,
  Circle,
  Fill,
  Group,
  polar2Canvas,
  mix,
  Skia,
  Image,
  useCanvasRef,
} from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";
import {
  runOnUI,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

import { useLoop } from "../../components/Animations";

const c1 = "#61bea2";
const c2 = "#529ca0";

interface RingProps {
  index: number;
  progress: SharedValue<number>;
}

const Ring = ({ index, progress }: RingProps) => {
  const { width, height } = useWindowDimensions();
  const R = width / 4;
  const center = useMemo(
    () => vec(width / 2, height / 2 - 64),
    [height, width]
  );

  const theta = (index * (2 * Math.PI)) / 6;
  const transform = useDerivedValue(() => {
    const { x, y } = polar2Canvas(
      { theta, radius: progress.value * R },
      { x: 0, y: 0 }
    );
    const scale = mix(progress.value, 0.3, 1);
    return [{ translateX: x }, { translateY: y }, { scale }];
  }, [progress, R]);

  return (
    <Circle
      c={center}
      r={R}
      color={index % 2 ? c1 : c2}
      origin={center}
      transform={transform}
    />
  );
};

const surface = Skia.Surface.MakeOffscreen(256, 256)!;
surface.getCanvas().drawColor(Skia.Color("cyan"));
const paint = Skia.Paint();
paint.setColor(Skia.Color("red"));
surface.getCanvas().drawCircle(128, 128, 128, paint);
surface.flush();
const jsImg = surface.makeImageSnapshot();
jsImg.makeShareable();

export const Breathe = () => {
  const ref = useCanvasRef();
  const image = useSharedValue<null | SkImage>(null);
  const { width, height } = useWindowDimensions();
  const center = useMemo(
    () => vec(width / 2, height / 2 - 64),
    [height, width]
  );

  const progress = useLoop({ duration: 3000 });

  const transform = useDerivedValue(() => {
    return [{ rotate: mix(progress.value, -Math.PI, 0) }];
  }, [progress]);

  useEffect(() => {
    runOnUI(() => {
      image.value = jsImg.transferToCurrentContext();
    })();
  }, [image]);

  return (
    <View style={{ flex: 1 }}>
      <Canvas style={styles.container} ref={ref}>
        <Fill color="rgb(36,43,56)" />
        <Group origin={center} transform={transform} blendMode="screen">
          <BlurMask style="solid" blur={40} />
          {new Array(6).fill(0).map((_, index) => {
            return <Ring key={index} index={index} progress={progress} />;
          })}
        </Group>
        <Image image={image} x={0} y={0} width={256} height={256} />
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
