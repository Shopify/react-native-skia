import React from "react";
import { useWindowDimensions, View } from "react-native";
import type { DataModule } from "@shopify/react-native-skia";
import {
  Canvas,
  ImageSVG,
  Skia,
  useFonts,
  useSVG,
} from "@shopify/react-native-skia";

const fonts: Record<string, DataModule[]> = {
  Roboto: [
    require("../../Tests/assets/Roboto-Medium.ttf"),
    require("../../Tests/assets/Roboto-Regular.ttf"),
  ],
};

export const SVG = () => {
  const { width, height } = useWindowDimensions();
  const svg = useSVG(require("./tiger.svg"));
  const fontMgr = useFonts(fonts);
  const svg2 = Skia.SVG.MakeFromString(
    `<svg height="40" width="200" xmlns="http://www.w3.org/2000/svg">
  <text x="5" y="30" fill="none" stroke="red" font-size="35">I love SVG!</text>
</svg>`,
    fontMgr
  );
  return (
    <View style={{ flex: 1 }}>
      <Canvas style={{ flex: 1 }}>
        <ImageSVG svg={svg} x={0} y={0} width={width / 2} height={height / 2} />
      </Canvas>
      <Canvas style={{ flex: 1 }}>
        <ImageSVG
          svg={svg2}
          x={0}
          y={0}
          width={width / 2}
          height={height / 2}
        />
      </Canvas>
    </View>
  );
};
