import { useEffect, useState } from "react";
import { setSkiaCanvasKit } from "../skia/Skia.web";
import CanvasKitInit from "canvaskit-wasm/bin/full/canvaskit";
import type {
  CanvasKit as CanvasKitType,
  CanvasKitInitOptions,
} from "canvaskit-wasm";

declare global {
  var CanvasKit: CanvasKitType;
}

let ckSharedPromise: Promise<CanvasKitType>;

/**
 * ```ts
 * const [loaded, error] = useLoadSkiaWeb(opts);
 * ```
 * Load CanvasKit, a WebAssembly build of Skia needed for web usage. This hook does nothing
 * on native platforms.
 * 
 * @param opts `CanvasKitInitOptions`. Note, the CanvasKit are not "reloaded" when you dynamically change the opts.
 * 
 * @return
 * - __loaded__ (`boolean`) - A boolean to detect if CanvasKit has finished loading.
 * - __error__ (`Error | null`) - An error encountered when loading the CanvasKit WebAssembly.
 */
export const useLoadSkiaWeb = (opts?: CanvasKitInitOptions) => {
  const [loadState, setLoadState] = useState<[boolean, null | Error]>([false, null]);

  useEffect(() => {
    if (global.CanvasKit) {
      return;
    }

    ckSharedPromise = ckSharedPromise ?? CanvasKitInit(opts);

    ckSharedPromise.then((CanvasKit) => {
      // The usage of this hook shouldn't need to set the global.CanvasKit,
      // but we're keeping it for backwards compatibility and interoperability
      // with the others web loaders solutions.
      global.CanvasKit = CanvasKit;
      setSkiaCanvasKit(CanvasKit);

      setLoadState([true, null]);
    }).catch((error) => {
      setLoadState([false, error]);
    });
  }, [setLoadState]);

  // Even trough this is not the expected usage of the hook, it is possible that
  // the user calls the hook multiple times, in this case we want to instantly return the
  // "loaded" state in true if the module has already been loaded, this is done by stopping the effect
  // from running and stopping the first render from happening. This would avoid any flicker effect
  // produced by a quick reredering of the component.
  if (!loadState[0] && global.CanvasKit) {
    setLoadState([true, null]);
  }

  return loadState;
}