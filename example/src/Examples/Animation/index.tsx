import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  useTouchHandler,
  Canvas,
  Group,
  Oval,
  Springs,
  useValue,
  color,
  Timing,
  useTiming,
  useLoop,
  useSequence,
} from "@shopify/react-native-skia";

const Size = 100;

export const AnimationExample: React.FC = () => {
  const { width } = useWindowDimensions();

  const translateX = useValue(width / 2 - Size / 2);
  const translateY = useValue(10);
  const xDiff = useValue(0);
  const yDiff = useValue(0);

  const colorValue = useValue(0);
  useLoop(
    Timing.create(colorValue, {
      duration: 1000,
    }),
    true
  );

  const xAnimation = useTiming(
    translateX,
    {
      duration: 1000,
      from: width + Size,
      to: width / 2 - Size / 2,
      easing: Timing.Easing.inOut(Timing.Easing.cubic),
    },
    true
  );

  const yAnimation = useTiming(
    translateY,
    {
      duration: 1000,
      from: 10,
      to: width / 2 - Size / 2,
      easing: Timing.Easing.inOut(Timing.Easing.cubic),
    },
    true
  );

  useSequence([xAnimation, yAnimation]);

  const touchHandler = useTouchHandler({
    onStart: ({ x, y }) => {
      xDiff.value = x - translateX.value;
      yDiff.value = y - translateY.value;
    },
    onActive: ({ x, y }) => {
      translateX.value = x - xDiff.value;
      translateY.value = y - yDiff.value;
    },
    onEnd: ({ velocityX, velocityY }) => {
      Springs.run(translateX, {
        to: width / 2 - Size / 2,
        config: Springs.WobblySlow({ velocity: velocityX }),
      });
      Springs.run(translateY, {
        to: width / 2 - Size / 2,
        config: Springs.WobblySlow({ velocity: velocityY }),
      });
    },
  });

  return (
    <Canvas style={StyleSheet.absoluteFill} onTouch={touchHandler} debug>
      <Group
        transform={() => [
          { translateX: translateX.value },
          { translateY: translateY.value },
        ]}
      >
        <Oval
          x={0}
          y={0}
          width={Size}
          height={Size}
          color={() => color(colorValue.value * 0xff, 0x00, 0xff, 1)}
        />
      </Group>
    </Canvas>
  );
};
