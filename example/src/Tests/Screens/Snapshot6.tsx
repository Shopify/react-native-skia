import type { SkImage } from "@shopify/react-native-skia";
import { Skia, Canvas, Image } from "@shopify/react-native-skia";
import React, { useEffect } from "react";
import { View } from "react-native";
import { runOnUI, useSharedValue } from "react-native-reanimated";

const size = 50;
const jsSurface = Skia.Surface.MakeOffscreen(size, size)!;
const jsCanvas = jsSurface.getCanvas();
jsCanvas.drawColor(Skia.Color("cyan"));
const jsImage = jsSurface.makeImageSnapshot();
const nonTexImage = jsImage.makeNonTextureImage();

export const Snapshot6 = () => {
  const image = useSharedValue<null | SkImage>(null);
  useEffect(() => {
    runOnUI(() => {
      image.value = jsImage.makeTextureImage();
      if (!image.value) {
        throw new Error("Failed to create texture image");
      }
    })();
  }, [image]);
  return (
    <View style={{ flex: 1 }}>
      <Canvas style={{ flex: 1 }} mode="continuous">
        <Image
          image={image}
          x={0}
          y={0}
          width={size}
          height={size}
          fit="cover"
        />
        <Image
          image={nonTexImage}
          x={0}
          y={size}
          width={size}
          height={size}
          fit="cover"
        />
      </Canvas>
    </View>
  );
};
