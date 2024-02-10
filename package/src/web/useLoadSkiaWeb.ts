import { useEffect, useState } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import CanvasKitInit from "canvaskit-wasm/bin/full/canvaskit";
import type {
  CanvasKit as CanvasKitType,
  CanvasKitInitOptions,
} from "canvaskit-wasm";

import { setSkiaCanvasKit } from "../skia/Skia.web";

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
  const [loadState, setLoadState] = useState<[boolean, null | Error]>(() => {
    if (global.CanvasKit) {
      return [true, null];
    }

    return [false, null];
  });

  useEffect(() => {
    if (global.CanvasKit) {
      return;
    }

    ckSharedPromise = ckSharedPromise ?? CanvasKitInit(opts);

    ckSharedPromise
      .then((CanvasKit) => {
        // The usage of this hook shouldn't need to set the global.CanvasKit,
        // but we're keeping it for backwards compatibility and interoperability
        // with the others web loaders solutions.
        global.CanvasKit = CanvasKit;
        setSkiaCanvasKit(CanvasKit);

        setLoadState([true, null]);
      })
      .catch((error) => {
        setLoadState([false, error]);
      });

    // We don't want to re-run this effect on changes of `opts`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLoadState]);

  return loadState;
};
