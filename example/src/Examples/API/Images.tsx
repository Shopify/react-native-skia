import React from "react";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import { useImage, Canvas, Image, Rect } from "@shopify/react-native-skia";

import { Title } from "./components/Title";

const { width: wWidth } = Dimensions.get("window");
const SIZE = wWidth / 3;
const S2 = 60;
const PAD = (SIZE - S2) / 2;

const fits = [
  "contain",
  "fill",
  "cover",
  "fitHeight",
  "fitWidth",
  "scaleDown",
  "none",
] as const;

const rects = [
  { x: 0, y: PAD, width: SIZE, height: S2 },
  { x: SIZE + PAD, y: 0, width: S2, height: SIZE },
  { x: 2 * SIZE, y: 0, width: SIZE, height: SIZE },
];

export const Images = () => {
  // Verifies that the error handler for images are working correctly.
  useImage(new Uint8Array([0, 0, 0, 255]), (err) => {
    if (err.message !== "Could not load data") {
      throw new Error(
        `Expected error message to be 'Could not load data' - got '${err.message}'`
      );
    }
  });
  useImage("https://reactjs.org/invalid.jpg", (err) => {
    if (err.message !== "Could not load data") {
      throw new Error(
        `Expected error message to be 'Could not load data' - got '${err.message}'`
      );
    }
  });

  // Verifies that we can use this hook with a null/undefined input parameter
  useImage(null);
  useImage(undefined);

  const oslo = useImage(require("../../assets/oslo.jpg"));

  return (
    <ScrollView>
      {fits.map((fit, i) => (
        <React.Fragment key={i}>
          <Title>{`fit="${fit}"`}</Title>
          <Canvas style={styles.container} key={fit}>
            {rects.map(({ x, y, width, height }, index) => {
              return (
                <React.Fragment key={index}>
                  <Rect
                    key={index}
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    color="lightblue"
                  />
                  {oslo ? (
                    <Image
                      image={oslo}
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fit={fit}
                    />
                  ) : null}
                </React.Fragment>
              );
            })}
          </Canvas>
        </React.Fragment>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: wWidth,
    height: SIZE,
  },
});
