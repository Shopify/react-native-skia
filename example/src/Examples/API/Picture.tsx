import type { SkPicture } from "@shopify/react-native-skia";
import {
  rect,
  Skia,
  Canvas,
  Picture,
  Group,
  Rect,
  Circle,
  PictureRecorder,
} from "@shopify/react-native-skia";
import React, { useMemo, useState } from "react";
import { StyleSheet } from "react-native";

export const PictureExample = () => {
  const [picture, setPicture] = useState<null | SkPicture>(null);

  // Serialize the picture
  const serialized = useMemo(() => {
    if (picture) {
      return picture.serialize();
    }
    return null;
  }, [picture]);

  // Create a copy from serialized data
  const copyOfPicture = useMemo(
    () => (serialized ? Skia.Picture.MakePicture(serialized) : null),
    [serialized]
  );

  return (
    <Canvas style={styles.container}>
      <PictureRecorder onRecord={setPicture} bounds={rect(0, 0, 100, 100)}>
        <Rect x={0} y={0} width={100} height={100} color="pink" />
        <Circle cx={50} cy={50} r={50} color="orange" />
      </PictureRecorder>
      <Picture picture={picture} />
      <Group transform={[{ translateX: 200 }]}>
        {copyOfPicture && <Picture picture={copyOfPicture} />}
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
