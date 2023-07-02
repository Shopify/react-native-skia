import React from "react";
import { StyleSheet } from "react-native";
import {
  Canvas,
  Fill,
  Image,
  Skia,
} from "@shopify/react-native-skia";

// const backSurface = Skia.Surface.MakeOffscreen(500, 500)!;
// let canvas = backSurface.getCanvas();
// canvas.drawColor(Skia.Color("green"));
// backSurface.flush();
// let encoded = backSurface.makeImageSnapshot().encodeToBase64()!;
// let image = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(encoded))!;

// const surface = Skia.Surface.MakeOffscreen(500, 500)!;
// const canvas = surface.getCanvas();
// //canvas.drawImage(image, 0, 0);
// canvas.drawColor(Skia.Color("cyan"));
// surface.flush();
// // TODO: Make non image texture should work
// const encoded = surface.makeImageSnapshot().encodeToBase64()!;
// const image = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(encoded))!;


const surface2 = Skia.Surface.MakeOffscreen(500, 500)!;
const canvas2 = surface2.getCanvas();
canvas2.drawColor(Skia.Color("green"));
surface2.flush();
const encoded2 = surface2.makeImageSnapshot().encodeToBase64()!;
const image2 = Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(encoded2))!;

export const Breathe = () => {
  return (
    <Canvas style={styles.container} debug>
      <Fill color="red" />
      {/* <Image image={image} x={0} y={0} width={500} height={500} />
      <Image image={image2} x={0} y={300} width={500} height={500} /> */}
       <Image image={image2} x={0} y={300} width={500} height={500} />
    </Canvas>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
