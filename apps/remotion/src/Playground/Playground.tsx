import React from "react";

import { Background, Canvas } from "../components";
import { makeAnimation, wait } from "../components/animations/Animations";

const playground = {};

const state = makeAnimation(function* ({}) {
  yield* wait(30);
}, playground);

export const durationInFrames = state.duration;

export const Playground = () => {
  return (
    <>
      <Canvas
        typefaces={{ RubikMedium: require("./assets/Rubik-Medium.otf") }}
        images={{}}
      >
        <Background />
      </Canvas>
    </>
  );
};
