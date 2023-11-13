import React from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import {
  Canvas,
  Image,
  useAnimatedImageValue,
} from "@shopify/react-native-skia";

export const AnimatedImages = () => {
  const { width: wWidth } = useWindowDimensions();
  const SIZE = wWidth / 3;
  const S2 = 60;
  const PAD = (SIZE - S2) / 2;

  const example1 = useAnimatedImageValue(
    require("../../assets/birdFlying.gif")
  );
  const example2 = useAnimatedImageValue(
    require("../../assets/birdFlying2.gif")
  );

  return (
    <ScrollView>
      <Canvas
        style={{
          alignSelf: "center",
          width: 320,
          height: 180,
          marginVertical: PAD,
        }}
      >
        <Image
          image={example1}
          x={0}
          y={0}
          width={320}
          height={180}
          fit="contain"
        />
      </Canvas>
      <Canvas
        style={{
          alignSelf: "center",
          width: 320,
          height: 180,
          borderColor: "#aaaaaa",
          borderWidth: 1,
          borderStyle: "solid",
          marginVertical: PAD,
        }}
      >
        <Image
          image={example2}
          x={0}
          y={0}
          width={320}
          height={180}
          fit="contain"
        />
      </Canvas>
    </ScrollView>
  );
};
