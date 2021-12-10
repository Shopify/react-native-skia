import React, { useEffect, useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  useTouchHandler,
  Canvas,
  Group,
  Oval,
  Spring,
  useValue,
  color,
  Timing,
  useLoop,
  useTimeline,
  Timeline,
} from "@shopify/react-native-skia";

const Size = 100;
const Top = 50;

export const AnimationExample: React.FC = () => {
  const { width, height } = useWindowDimensions();

  const translateX = useValue(0);
  const translateY = useValue(0);
  const xDiff = useValue(0);
  const yDiff = useValue(0);

  // const circles = useTimeline(
  //   new Array(35).fill(0).map(() =>
  //     Spring.create({
  //       from: Top,
  //       to: 200 + Top,
  //       config: Spring.Wobbly(),
  //     })
  //   ),
  //   {
  //     each: 125,
  //   }
  // );

  const colorValue = useValue(0);
  useLoop(
    colorValue,
    Timeline.add(
      Timing.create({
        duration: 750,
      }),
      colorValue,
      { yoyo: true, repeat: 2 }
    )
  );

  // useDelay(
  //   Timeline.loop(
  //     Timeline.sequence([
  //       Timing.create(translateX, {
  //         to: width - Size,
  //         easing: Timing.Easing.inOut(Timing.Easing.cubic),
  //       }),
  //       Timing.create(translateY, {
  //         to: height * 0.9 - Size,
  //         easing: Timing.Easing.inOut(Timing.Easing.cubic),
  //       }),
  //       Timing.create(translateX, {
  //         to: 0,
  //         easing: Timing.Easing.inOut(Timing.Easing.cubic),
  //       }),
  //       Timing.create(translateY, {
  //         to: 0,
  //         easing: Timing.Easing.inOut(Timing.Easing.cubic),
  //       }),
  //     ]),
  //     { yoyo: true }
  //   ),
  //   { delaySeconds: 2 }
  // );

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
      Spring.run(translateX, {
        to: width / 2 - Size / 2,
        config: Spring.WobblySlow({ velocity: -velocityX }),
      });
      Spring.run(translateY, {
        to: width / 2 - Size / 2,
        config: Spring.WobblySlow({ velocity: -velocityY }),
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
        {/* 
        {circles.values.map((c, i) => (
          <Oval
            key={i}
            x={i * 10 + 40}
            y={() => c.value}
            width={10}
            height={10}
            color={() =>
              color(i * (255.0 / circles.values.length), 0xff * 0.5, 0x00, 1)
            }
          />
        ))} */}
      </Canvas>
    </>
  );
};
