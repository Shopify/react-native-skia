import { vec, Fill } from "@shopify/react-native-skia";

import { Background, Canvas } from "../components";
import {
  useAnimation,
  makeAnimation,
  stagger,
  timing,
} from "../components/animations/Animations";
import { useImages } from "../components/Canvas";

import { Tile } from "./components/Tile";

const duration = 20;

const playground = {
  expoProgress: 0,
  skiaProgress: 0,
  remotionProgress: 0,
  snackProgress: 0,
  webProgress: 0,
  uiProgress: 0,
  reconcilerProgress: 0,
  picturesProgress: 0,
};

const state = makeAnimation(function* ({
  expoProgress,
  skiaProgress,
  remotionProgress,
  snackProgress,
  webProgress,
  uiProgress,
  reconcilerProgress,
  picturesProgress,
}) {
  yield* stagger(
    8,
    timing(skiaProgress, { duration }),
    timing(expoProgress, { duration }),
    timing(snackProgress, { duration }),
    timing(webProgress, { duration }),
    timing(uiProgress, { duration }),
    timing(reconcilerProgress, { duration }),
    timing(picturesProgress, { duration }),
    timing(remotionProgress, { duration })
  );
},
playground);

const remotionPos = vec(50, 565);
const skiaPos = vec(1220, 565);
const expoPos = vec(50, 50);
const snackPos = vec(1945, 50);
const webPos = vec(2679, 565);
const uiPos = vec(50, 1645);
const reconcilerPos = vec(1001, 1645);
const picturesPos = vec(1952, 1645);

export const durationInFrames = state.duration;

export const Playground = () => {
  return (
    <>
      <Canvas
        typefaces={{ RubikMedium: require("./assets/Rubik-Medium.otf") }}
        images={{
     
        }}
      >
        <Fill color="black" />
        <Tiles />
      </Canvas>
    </>
  );
};

const Tiles = () => {

  return (
    <>
      <Background />
    </>
  );
};
