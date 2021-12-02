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
  useLoop,
} from "@shopify/react-native-skia";

const Size = 100;

export const AnimationExample: React.FC = () => {
  const { width } = useWindowDimensions();

  const translateX = useValue(width / 2 - Size / 2);
  const translateY = useValue(width / 2 - Size / 2);
  const xDiff = useValue(0);
  const yDiff = useValue(0);

  const loopValue = useValue(0);
  useLoop(loopValue, { duration: 1000, yoyo: true });

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
    <Canvas style={styles.skiaview} onTouch={touchHandler} debug>
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
          color={() => color(loopValue.value * 0xff, 0x00, 0xff, 1)}
        />
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  skiaview: {
    width: "100%",
    flex: 1,
    overflow: "hidden",
  },
});
