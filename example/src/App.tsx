import React, { useMemo } from "react";
import { useWindowDimensions } from "react-native";
import {
  vec,
  Circle,
  polar2Canvas,
  mix,
  SkiaPictureView,
  Skia,
} from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";
import { useDerivedValue } from "react-native-reanimated";

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

const recorder = Skia.PictureRecorder();
const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, 48, 48));
canvas.drawColor(Skia.Color("rgb(36,43,56)"));
const picture = recorder.finishRecordingAsPicture();

const App = () => {
  return (
    <SkiaPictureView picture={picture} style={{ flex: 1 }} mode="continuous" />
  );
};

export default App;
