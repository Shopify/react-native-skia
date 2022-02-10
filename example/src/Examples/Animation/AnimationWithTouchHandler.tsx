import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import {
  Canvas,
  Circle,
  Fill,
  runSpring,
  Spring,
  useTouchHandler,
  useValue,
} from "@shopify/react-native-skia";

import { AnimationDemo, Size, Padding } from "./Components";

const { width } = Dimensions.get("window");

export const AnimationWithTouchHandler = () => {
  const translateX = useValue((width - Size - Padding) / 2);
  const offsetX = useValue(0);
  const touchHandler = useTouchHandler({
    onStart: ({ x }) => {
      offsetX.value = x - translateX.value;
      // Take over the value (stop any animations)
      translateX.setDriver(undefined);
    },
    onActive: ({ x }) => (translateX.value = x - offsetX.value),
    onEnd: ({ velocityX }) => {
      runSpring(
        translateX,
        (width - Size - Padding) / 2,
        Spring.Wobbly({ velocity: velocityX })
      );
    },
  });

  return (
    <AnimationDemo title={"Animation with touch handler."}>
      <Canvas style={styles.canvas} onTouch={touchHandler}>
        <Fill color="white" />
        <Circle cx={translateX} cy={40} r={20} color="#EEE" />
        <Circle cx={translateX} cy={40} r={15} color="#CECECE" />
      </Canvas>
    </AnimationDemo>
  );
};

const styles = StyleSheet.create({
  canvas: {
    height: 80,
    width: width - Padding,
    backgroundColor: "#FEFEFE",
  },
});
