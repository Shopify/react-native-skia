import {
  Canvas,
  Rect,
  Skia,
  processTransform3d,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = CARD_WIDTH / 1.618;
const rct = Skia.XYWHRect(
  (width - CARD_WIDTH) / 2,
  (height - CARD_HEIGHT) / 2,
  CARD_WIDTH,
  CARD_HEIGHT
);

export const FrostedCard = () => {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onChange((event) => {
      rotateY.value += event.changeX / 300;
      rotateX.value -= event.changeY / 300;
    })
    .onFinalize(() => {
      rotateX.value = withSpring(0);
      rotateY.value = withSpring(0);
    });

  const matrix = useDerivedValue(() => {
    return processTransform3d([
      { translate: [width / 2, height / 2] },
      { perspective: 300 },
      { rotateX: rotateX.value },
      { rotateY: rotateY.value },
      { translate: [-width / 2, -height / 2] },
    ]);
  });
  return (
    <View style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <Canvas style={{ flex: 1 }}>
          <Rect rect={rct} matrix={matrix} />
        </Canvas>
      </GestureDetector>
    </View>
  );
};
