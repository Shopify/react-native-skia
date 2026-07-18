import type {
  CanvasKit as CanvasKitType,
  CanvasKitInitOptions,
} from "canvaskit-wasm";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CanvasKitInit from "@shopify/react-native-skia/dist/canvaskit/canvaskit.js";

declare global {
  var CanvasKit: CanvasKitType;
}

let ckSharedPromise: Promise<CanvasKitType>;

type CanvasKitWithEncodingOptions = CanvasKitType & {
  _rnskiaImageEncodingOptions?: boolean;
  _rnskiaImageEncodingVersion?: number;
};

const assertCompatibleCanvasKit = (CanvasKit: CanvasKitType) => {
  const versionedCanvasKit = CanvasKit as CanvasKitWithEncodingOptions;
  if (
    versionedCanvasKit._rnskiaImageEncodingOptions !== true ||
    versionedCanvasKit._rnskiaImageEncodingVersion !== 1
  ) {
    throw new Error(
      "The loaded CanvasKit build is incompatible with React Native Skia. " +
        "Run setup-skia-web and load the bundled canvaskit.wasm file."
    );
  }
};

export const LoadSkiaWeb = async (opts?: CanvasKitInitOptions) => {
  if (global.CanvasKit !== undefined) {
    assertCompatibleCanvasKit(global.CanvasKit);
    return;
  }
  ckSharedPromise = ckSharedPromise ?? CanvasKitInit(opts);
  const CanvasKit = await ckSharedPromise;
  assertCompatibleCanvasKit(CanvasKit);
  // The CanvasKit API is stored on the global object and used
  // to create the JsiSKApi in the Skia.web.ts file.
  global.CanvasKit = CanvasKit;
};

// We keep this function for backward compatibility
export const LoadSkia = LoadSkiaWeb;
