import React from "react";
import {
  Picture,
  Skia,
  Canvas,
  useClock,
  Fill,
  Group,
} from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";

import lego from "./lego_loader.json";

const animation = Skia.Skottie.Make(JSON.stringify(lego))!;

export const Skottie = () => {
  console.log("Skottie animation:", animation);
  const clock = useClock();
  const picture = useDerivedValue(() => {
    const rec = Skia.PictureRecorder();
    const canvas = rec.beginRecording({
      x: 0,
      y: 0,
      width: 2_000_000,
      height: 2_000_000,
    });
    const fps = animation.fps();
    const duration = animation.duration();
    const currentFrame =
      Math.floor((clock.value / 1000) * fps) % (duration * fps);
    console.log("Current frame:", currentFrame);
    animation.seekFrame(currentFrame);
    animation.render(canvas, { x: 0, y: 0, width: 800, height: 800 });
    return rec.finishRecordingAsPicture();
  });
  return (
    <Canvas style={{ flex: 1 }}>
      <Group transform={[{ scale: 0.5 }]}>
        <Picture picture={picture} />
      </Group>
    </Canvas>
  );
};
