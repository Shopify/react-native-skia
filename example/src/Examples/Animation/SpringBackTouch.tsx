import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import {
  Canvas,
  Fill,
  Line,
  Rect,
  runSpring,
  Spring,
  useDerivedValue,
  useTouchHandler,
  useValue,
} from "@shopify/react-native-skia";

import { AnimationDemo, Size, Padding } from "./Components";

export const SpringBackTouchAnimation = () => {
  const { width } = useWindowDimensions();

  // Translate values for the rect
  const centerX = useMemo(() => width / 2 - (Size * 2 - Padding), [width]);
  const rectX = useValue(centerX);
  const rectY = useValue(Size);

  // Offset to let us pick up the rect from anywhere
  const offsetX = useValue(0);
  const offsetY = useValue(0);

  const rectCenter = useDerivedValue(
    (x, y) => ({ x: x + Size, y: y + Size }),
    [rectX, rectY]
  );

  // Touch handler
  const touchHandler = useTouchHandler({
    onStart: ({ x, y }) => {
      offsetX.value = x - rectX.value;
      offsetY.value = y - rectY.value;
    },
    onActive: ({ x, y }) => {
      rectX.value = Math.max(
        Size,
        Math.min(width - Size - Padding, x - offsetX.value)
      );
      rectY.value = y - offsetY.value;
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
          color="#D4B3B7"
          strokeWidth={2}
          style="fill"
        />
        <Rect
          x={rectX}
          y={rectY}
          width={Size * 2}
          height={Size * 2}
          color="#D4B3B7"
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
