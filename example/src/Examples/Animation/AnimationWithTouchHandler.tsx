import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import {
  Canvas,
  Spring,
  useTouchHandler,
  useValue,
} from "@shopify/react-native-skia";

import { AnimationElement, AnimationDemo, Size, Padding } from "./Components";

const { width } = Dimensions.get("window");

export const AnimationWithTouchHandler = () => {
  const translateX = useValue((width - Size - Padding) / 2);
  const diffX = useValue(0);
  const touchHandler = useTouchHandler({
    onStart: ({ x }) => {
      diffX.value = x - translateX.value;
      // Stop any animations by updating the animation value
      translateX.value = translateX.value;
    },
    onActive: ({ x }) => (translateX.value = x - diffX.value),
    onEnd: ({ velocityX }) => {
      Spring.run(
        translateX,
        (width - Size - Padding) / 2,
        Spring.Wobbly({ velocity: velocityX })
      );
    },
  });

  return (
    <AnimationDemo title={"Animation with touch handler."}>
      <Canvas style={styles.canvas} onTouch={touchHandler}>
        <AnimationElement x={() => translateX.value} />
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
