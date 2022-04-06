import type { ReactNode } from "react";
import React, { useMemo, useState, useEffect, Children } from "react";

import type { SkRect } from "../../skia";
import { Skia } from "../../skia";
import type { SkPicture } from "../../skia/Picture";
import { createDrawing } from "../nodes";

interface PictureRecorderProps {
  onRecord: (picture: SkPicture) => void;
  bounds: SkRect;
  children?: ReactNode | ReactNode[];
}

export const PictureRecorder = ({
  onRecord,
  bounds,
  ...props
}: PictureRecorderProps) => {
  const [picture, setPicture] = useState<SkPicture | null>(null);
  const onDraw = useMemo(
    () =>
      createDrawing<PictureRecorderProps>((ctx, {}, node) => {
        if (picture === null) {
          console.log("Record: " + new Date().getSeconds());
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
