/* eslint-disable import/no-default-export */
import React from "react";
import { SkiaPictureView, Skia } from "@shopify/react-native-skia";

const recorder = Skia.PictureRecorder();
const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, 48, 48));
canvas.drawColor(Skia.Color("rgb(36,43,56)"));
const picture = recorder.finishRecordingAsPicture();

const App = () => {
  return (
    <SkiaPictureView picture={picture} style={{ flex: 1 }} mode="continuous" />
  );
};

export default App;
