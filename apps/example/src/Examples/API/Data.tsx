import React from "react";
import { useWindowDimensions } from "react-native";
import {
  AlphaType,
  Canvas,
  ColorType,
  Image,
  Skia,
} from "@shopify/react-native-skia";

const pixels = new Uint8Array(256 * 256 * 4);
pixels.fill(255);
let i = 0;
for (let x = 0; x < 256 * 4; x++) {
  for (let y = 0; y < 256 * 4; y++) {
    pixels[i++] = (x * y) % 255;
  }
}
const data = Skia.Data.fromBytes(pixels);
const img = Skia.Image.MakeImage(
  {
    width: 256,
    height: 256,
    alphaType: AlphaType.Opaque,
    colorType: ColorType.RGBA_8888,
  },
  data,
  256 * 4
)!;

export const Data = () => {
  const { width } = useWindowDimensions();
  const SIZE = width;
  return (
    <Canvas style={{ width: SIZE, height: SIZE }}>
      <Image image={img} x={0} y={0} width={256} height={256} fit="cover" />
    </Canvas>
  );
};
