import React from "react";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import { Canvas, Image, Rect } from "@shopify/react-native-skia";
import { useImage } from "@shopify/react-native-skia/src/skia/Image/useImage";

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
  const oslo = useImage(require("../../assets/oslo.jpg"));
  if (oslo === null) {
    return null;
  }
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
                  <Image
                    source={oslo}
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fit={fit}
                  />
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
