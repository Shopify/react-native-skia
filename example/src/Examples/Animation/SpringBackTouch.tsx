import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Circle,
  Fill,
  Line,
  runSpring,
  Spring,
  useComputedValue,
  useTouchHandler,
  useValue,
} from "@shopify/react-native-skia";

import { AnimationDemo, Size, Padding } from "./Components";

const FgColor = "#DC4C4C";
const BgColor = "#EC795A";

export const SpringBackTouchAnimation = () => {
  const { width } = useWindowDimensions();

  // Translate values for the rect
  const centerX = useMemo(() => width / 2 - (Size * 2 - Padding), [width]);
  const rectX = useValue(centerX);
  const rectY = useValue(Size);

  // Offset to let us pick up the rect from anywhere
  const offsetX = useValue(0);
  const offsetY = useValue(0);

  const rectCenter = useComputedValue(
    () => ({ x: rectX.current + Size, y: rectY.current + Size }),
    [rectX, rectY]
  );

  // Touch handler
  const touchHandler = useTouchHandler({
    onStart: ({ x, y }) => {
      offsetX.current = x - rectX.current;
      offsetY.current = y - rectY.current;
    },
    onActive: ({ x, y }) => {
      rectX.current = Math.max(
        Size,
        Math.min(width - Size - Padding, x - offsetX.current)
      );
      rectY.current = y - offsetY.current;
    },
    onEnd: ({ velocityX, velocityY }) => {
      runSpring(rectX, centerX, Spring.Gentle({ velocity: velocityX }));
      runSpring(rectY, Size, Spring.Gentle({ velocity: velocityY }));
    },
  });

  return (
    <AnimationDemo title={"Spring back animation"}>
      <Canvas style={styles.canvas} onTouch={touchHandler}>
        <Fill color="white" />
        <Line
          p1={{ x: width / 2 - (Size - Padding), y: 0 }}
          p2={rectCenter}
          color={BgColor}
          strokeWidth={2}
          style="fill"
        />
        <Circle c={rectCenter} r={Size} color={FgColor} />
        <Circle
          c={rectCenter}
          r={Size}
          color={BgColor}
          strokeWidth={5}
          style="stroke"
        />
      </Canvas>
    </AnimationDemo>
  );
};

const styles = StyleSheet.create({
  canvas: {
    height: 280,
    width: "100%",
    backgroundColor: "#FEFEFE",
  },
});
