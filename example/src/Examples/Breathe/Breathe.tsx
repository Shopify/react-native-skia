import React from "react";
import { StyleSheet } from "react-native";
import {
  Canvas,
  Fill,
  Image,
  Skia,
} from "@shopify/react-native-skia";

const backSurface = Skia.Surface.MakeOffscreen(500, 500)!;
let canvas = backSurface.getCanvas();
canvas.drawColor(Skia.Color("pink"));
backSurface.flush();
const snap = backSurface.makeImageSnapshot();
let encoded = snap.encodeToBase64()!;
let image = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(encoded))!;

const surface2 = Skia.Surface.MakeOffscreen(500, 500)!;
const canvas2 = surface2.getCanvas();
canvas2.drawColor(Skia.Color("green"));
canvas2.drawImage(snap, 0, 0);
surface2.flush();
const encoded2 = surface2.makeImageSnapshot().encodeToBase64()!;
const image2 = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(encoded2))!;

export const Breathe = () => {
  return (
    <Canvas style={styles.container} debug>
      <Fill color="red" />
       <Image image={image} x={0} y={0} width={500} height={500} />
       <Image image={image2} x={0} y={300} width={500} height={500} />
    </Canvas>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
