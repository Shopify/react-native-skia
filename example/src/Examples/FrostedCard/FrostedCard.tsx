import {
  Canvas,
  Rect,
  Skia,
  processTransform3d,
  useImage,
  Image,
  Blur,
  BackdropFilter,
  Fill,
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
const rrct = Skia.RRectXY(rct, 10, 10);

export const FrostedCard = () => {
  const image = useImage(require("./dynamo.jpg"));
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onChange((event) => {
      rotateY.value += event.changeX / 300;
      rotateX.value -= event.changeY / 300;
    })
    .onFinalize(({ velocityX, velocityY }) => {
      rotateX.value = withSpring(0, { velocity: velocityY / 300 });
      rotateY.value = withSpring(0, { velocity: velocityX / 300 });
    });

  const clip = useDerivedValue(() => {
    const m3 = processTransform3d([
      { translate: [width / 2, height / 2] },
      { perspective: 300 },
      { rotateX: rotateX.value },
      { rotateY: rotateY.value },
      { translate: [-width / 2, -height / 2] },
    ]);
    const path = Skia.Path.Make();
    path.addRRect(rrct);
    path.transform(Skia.Matrix(m3));
    return path;
  });
  return (
    <View style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <Canvas style={{ flex: 1 }}>
          <Image
            image={image}
            x={0}
            y={0}
            width={width}
            height={height}
            fit="cover"
          />
          <BackdropFilter filter={<Blur blur={10} />} clip={clip}>
            <Fill color="rgba(255, 255, 255, 0.1)" />
          </BackdropFilter>
        </Canvas>
      </GestureDetector>
    </View>
  );
};
