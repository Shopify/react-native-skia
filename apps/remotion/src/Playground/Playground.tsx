import React from "react";
import {
  fitbox,
  Group,
  ImageSVG,
  rect,
  Skia,
  useSVG,
} from "@shopify/react-native-skia";

import { Background, Canvas } from "../components";
import { makeAnimation, wait } from "../components/animations/Animations";

const playground = {};

const state = makeAnimation(function* ({}) {
  yield* wait(30);
}, playground);

export const durationInFrames = state.duration;

const SVG_URL =
  "https://upload.wikimedia.org/wikipedia/commons/f/fd/Ghostscript_Tiger.svg";

export const Playground = () => {
  const svg = useSVG(SVG_URL);
  const svg2 = Skia.SVG.MakeFromString(
    `
      <svg viewBox='0 0 20 20' width="20" height="20" xmlns='http://www.w3.org/2000/svg'>
        <circle cx='10' cy='10' r='10' fill='red'/>
      </svg>
    `
  )!;

  const src = rect(0, 0, svg2.width(), svg2.height());
  const dst = rect(0, 0, 400, 400);
  return (
    <>
      <Canvas
        typefaces={{ RubikMedium: require("./assets/Rubik-Medium.otf") }}
        images={{}}
      >
        <Background />
        <ImageSVG svg={svg} width={256} height={256} />
        <Group transform={fitbox("contain", src, dst)}>
          <ImageSVG svg={svg2} x={0} y={0} width={20} height={20} />
        </Group>
      </Canvas>
    </>
  );
};
