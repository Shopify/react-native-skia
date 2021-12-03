import React from "react";
import { Button, StyleSheet, useWindowDimensions } from "react-native";
import {
  useTouchHandler,
  Canvas,
  Group,
  Oval,
  Springs,
  useValue,
  color,
  Timing,
  Timeline,
  useLoop,
  useDelay,
} from "@shopify/react-native-skia";

const Size = 100;

export const AnimationExample: React.FC = () => {
  const { width, height } = useWindowDimensions();

  const translateX = useValue(0);
  const translateY = useValue(0);
  const xDiff = useValue(0);
  const yDiff = useValue(0);

  const colorValue = useValue(0);
  useLoop(
    Timing.create(colorValue, {
      duration: 750,
    }),
    { yoyo: true }
  );

  useDelay(
    Timeline.loop(
      Timeline.sequence([
        Timing.create(translateX, {
          to: width - Size,
          easing: Timing.Easing.inOut(Timing.Easing.cubic),
        }),
        Timing.create(translateY, {
          to: height * 0.9 - Size,
          easing: Timing.Easing.inOut(Timing.Easing.cubic),
        }),
        Timing.create(translateX, {
          to: 0,
          easing: Timing.Easing.inOut(Timing.Easing.cubic),
        }),
        Timing.create(translateY, {
          to: 0,
          easing: Timing.Easing.inOut(Timing.Easing.cubic),
        }),
      ]),
      { yoyo: true, repeatCount: 1 }
    ),
    { delaySeconds: 2 }
  );

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
        config: Springs.WobblySlow({ velocity: -velocityX }),
      });
      Springs.run(translateY, {
        to: width / 2 - Size / 2,
        config: Springs.WobblySlow({ velocity: -velocityY }),
      });
    },
  });

  return (
    <>
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
      <Button
        title="Animate"
        onPress={() => {
          Springs.run(translateX, {
            to: Math.random() * (width - Size),
            config: Springs.WobblySlow(),
          });
          Springs.run(translateY, {
            to: Math.random() * (height - Size),
            config: Springs.WobblySlow(),
          });
        }}
      />
    </>
  );
};
