import React from "react";
import { StyleSheet, Dimensions } from "react-native";
import {
  AlphaType,
  Canvas,
  ColorType,
  Image,
  Skia,
} from "@shopify/react-native-skia";
import { useImage } from "@shopify/react-native-skia/src/skia/Image/useImage";

const { width } = Dimensions.get("window");
const SIZE = width;

export const Data = () => {
  const img = useImage(require("../../assets/discrete.png"));
  if (img === null) {
    return null;
  }
  const pixels = new Uint8Array(256 * 256 * 4);
  pixels.fill(255);
  const data = Skia.Data.fromBytes(pixels);
  const img2 = Skia.MakeImage(
    {
      width: 256,
      height: 256,
      alphaType: AlphaType.Opaque,
      colorType: ColorType.RGBA_8888,
    },
    data,
    256 * 4
  );
  if (!img2) {
    return null;
  }
  return (
    <Canvas style={styles.container}>
      <Image image={img2} x={0} y={0} width={256} height={256} fit="cover" />
    </Canvas>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
  },
});
