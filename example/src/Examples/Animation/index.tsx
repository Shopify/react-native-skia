import React, { useMemo } from "react";
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
  Timelines,
  createValue,
  useLoop,
  useDelay,
  useStagger,
} from "@shopify/react-native-skia";

const Size = 100;
const Top = 50;

export const AnimationExample: React.FC = () => {
  const { width, height } = useWindowDimensions();

  const translateX = useValue(0);
  const translateY = useValue(0);
  const xDiff = useValue(0);
  const yDiff = useValue(0);

  // Create some circles
  const circles = useMemo(() => {
    return new Array(35).fill(0).map((_, i) => ({
      colorStr: "#435589",
      value: createValue(0),
      x: 20 + i * 15,
    }));
  }, []);

  useStagger(
    circles.map((c) =>
      Timelines.loop(
        Timing.create(c.value, {
          to: height * 0.2,
          duration: 1000,
          easing: Timing.Easing.inOut(Timing.Easing.cubic),
        }),
        { yoyo: true, repeatCount: Infinity }
      )
    )
  );

  const colorValue = useValue(0);
  useLoop(
    Timing.create(colorValue, {
      duration: 750,
    }),
    { yoyo: true }
  );

  useDelay(
    Timelines.loop(
      Timelines.sequence([
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
      { yoyo: true }
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
      <Canvas
        style={StyleSheet.absoluteFillObject}
        onTouch={touchHandler}
        debug
      >
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

        {circles.map(({ value, x }, i) => (
          <Oval
            key={x}
            x={i * 10 + Top}
            y={() => value.value}
            width={10}
            height={10}
            color={() =>
              color(i * (255.0 / circles.length), 0xff * 0.5, 0x00, 1)
            }
          />
        ))}
      </Canvas>
    </>
  );
};
