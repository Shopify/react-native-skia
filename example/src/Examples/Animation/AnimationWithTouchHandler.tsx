import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import {
  Canvas,
  Spring,
  useTouchHandler,
  useValue,
} from "@shopify/react-native-skia";
import { runSpring } from "@shopify/react-native-skia/src/animation/Animation/functions";

import { AnimationElement, AnimationDemo, Size, Padding } from "./Components";

const { width } = Dimensions.get("window");

export const AnimationWithTouchHandler = () => {
  const translateX = useValue((width - Size - Padding) / 2);
  const offsetX = useValue(0);
  const touchHandler = useTouchHandler({
    onStart: ({ x }) => (offsetX.value = x - translateX.value),
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
