import { vec, Fill } from "@shopify/react-native-skia";

import { Canvas } from "../components";
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
          expo: require("./assets/tiles/sdk46.png"),
          skia: require("./assets/tiles/skia.png"),
          remotion: require("./assets/tiles/remotion.png"),
          snack: require("./assets/tiles/snack.png"),
          web: require("./assets/tiles/react-native-web.png"),
          ui: require("./assets/tiles/ui.png"),
          reconciler: require("./assets/tiles/reconciler.png"),
          pictures: require("./assets/tiles/pictures.png"),
        }}
      >
        <Fill color="black" />
        <Tiles />
      </Canvas>
      {/* <Sequence from={0} durationInFrames={durationInFrames} layout="none">
        <Audio src={audio} startFrom={0} endAt={durationInFrames} />
      </Sequence> */}
    </>
  );
};

const Tiles = () => {
  const { skia, remotion, expo, snack, web, ui, reconciler, pictures } =
    useImages();
  const {
    expoProgress,
    snackProgress,
    remotionProgress,
    skiaProgress,
    webProgress,
    uiProgress,
    reconcilerProgress,
    picturesProgress,
  } = useAnimation(state);
  return (
    <>
      <Tile image={expo} pos={expoPos} progress={expoProgress} />
      <Tile image={snack} pos={snackPos} progress={snackProgress} />
      <Tile image={remotion} pos={remotionPos} progress={remotionProgress} />
      <Tile image={skia} pos={skiaPos} progress={skiaProgress} />
      <Tile image={web} pos={webPos} progress={webProgress} />
      <Tile image={ui} pos={uiPos} progress={uiProgress} />
      <Tile
        image={reconciler}
        pos={reconcilerPos}
        progress={reconcilerProgress}
      />
      <Tile image={pictures} pos={picturesPos} progress={picturesProgress} />
    </>
  );
};
