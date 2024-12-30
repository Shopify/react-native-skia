import { Composition } from "remotion";

import {
  Playground,
  durationInFrames as playgroundDurationInFrames,
} from "./Playground";
import { CANVAS, fps } from "./components/Theme";


const { width, height } = CANVAS;

export const RemotionVideo = () => {
  return (
    <>
      <Composition
        id="Playground"
        component={Playground}
        durationInFrames={playgroundDurationInFrames}
        fps={fps}
        width={width}
        height={height}
      />
    </>
  );
};
