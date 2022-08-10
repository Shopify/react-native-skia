import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";
import { useImage, Canvas, Image, Rect } from "@shopify/react-native-skia";

import { Title } from "./components/Title";

const fits = [
  "contain",
  "fill",
  "cover",
  "fitHeight",
  "fitWidth",
  "scaleDown",
  "none",
] as const;

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
  const coffee = useImage("https://picsum.photos/id/1060/640/360");

  // Verify that "useImage" works even when source change
  const [asyncUrl, setAsyncUrl] = useState<string>();

  // Verify that "useImage" works even when the source change after initial rendering
  // It could be because the source is fetched remotely, or defined only after some interactions...
  const asyncImage = useImage(asyncUrl);
  useEffect(() => {
    const interval = setInterval(() => {
      setAsyncUrl(
        asyncUrl ? undefined : "https://picsum.photos/id/1050/640/360"
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [asyncUrl]);

  const { width: wWidth } = useWindowDimensions();
  const SIZE = wWidth / 3;
  const S2 = 60;
  const PAD = (SIZE - S2) / 2;

  const rects = useMemo(
    () => [
      { x: 0, y: PAD, width: SIZE, height: S2 },
      { x: SIZE + PAD, y: 0, width: S2, height: SIZE },
      { x: 2 * SIZE, y: 0, width: SIZE, height: SIZE },
    ],
    [PAD, SIZE]
  );

  return (
    <ScrollView>
      {fits.map((fit, i) => (
        <React.Fragment key={i}>
          <Title>{`fit="${fit}"`}</Title>
          <Canvas style={{ width: wWidth, height: SIZE }} key={fit}>
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
      <Title>Remote sources</Title>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        {coffee ? (
          <Canvas
            style={{
              alignSelf: "center",
              width: 320,
              height: 180,
              marginVertical: PAD,
            }}
          >
            <Image
              image={coffee}
              x={0}
              y={0}
              width={320}
              height={180}
              fit="contain"
            />
          </Canvas>
        ) : null}
        {asyncImage ? (
          <Canvas
            style={{
              alignSelf: "center",
              width: 320,
              height: 180,
              marginVertical: PAD,
            }}
          >
            <Image
              image={asyncImage}
              x={0}
              y={0}
              width={320}
              height={180}
              fit="contain"
            />
          </Canvas>
        ) : (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              width: 320,
              height: 180,
            }}
          >
            <ActivityIndicator />
          </View>
        )}
      </View>
    </ScrollView>
  );
};
