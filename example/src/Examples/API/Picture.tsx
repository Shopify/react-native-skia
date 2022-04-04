import type { SkPicture, SkRect } from "@shopify/react-native-skia";
import {
  createDrawing,
  rect,
  Skia,
  Canvas,
  Picture,
  Group,
  Rect,
  Circle,
} from "@shopify/react-native-skia";
import type { ReactNode } from "react";
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
      <RecordPicture
        onRecord={(pic) => setPicture(pic)}
        bounds={rect(0, 0, 100, 100)}
      >
        <Rect x={0} y={0} width={100} height={100} color="pink" />
        <Circle cx={50} cy={50} r={50} color="orange" />
      </RecordPicture>
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

interface RecordPictureProps {
  onRecord: (picture: SkPicture) => void;
  bounds: SkRect;
  children?: ReactNode | ReactNode[];
}

const RecordPicture = ({ onRecord, bounds, ...props }: RecordPictureProps) => {
  const [picture, setPicture] = useState<null | SkPicture>(null);
  const onDraw = useMemo(
    () =>
      createDrawing<RecordPictureProps>((ctx, {}, node) => {
        if (picture === null) {
          const recorder = Skia.PictureRecorder();
          const canvas = recorder.beginRecording(bounds);
          node.visit({
            ...ctx,
            canvas,
          });
          const pic = recorder.finishRecordingAsPicture();
          setPicture(pic);
          onRecord(pic);
        }
      }),
    [bounds, onRecord, picture]
  );
  return <skDrawing onDraw={onDraw} skipProcessing {...props} />;
};
