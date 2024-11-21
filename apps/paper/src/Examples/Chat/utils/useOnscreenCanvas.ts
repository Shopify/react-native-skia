import {
  type SkCanvas,
  type SkSurface,
  Skia,
  type SkiaContext,
} from "@shopify/react-native-skia";
import { useCallback, useEffect } from "react";
import { PixelRatio } from "react-native";
import { runOnUI, useSharedValue } from "react-native-reanimated";
import { type CanvasRef, useGPUContext } from "react-native-wgpu";

const ratio = PixelRatio.get();

interface OnscreenCanvasState {
  forceRerender: boolean;
}

const getNativeSurface = global.RNWebGPU?.getNativeSurface;
function useSkiaContext() {
  const { ref, context } = useGPUContext();
  const state = useSharedValue<{
    changed: boolean;
    skiaContext: SkiaContext | null;
    cachedSurfacePointer: bigint | null;
    contextId: number | null;
    cachedSurface: SkSurface | null;
    cachedCanvas: SkCanvas | null;
  }>({
    changed: false,
    skiaContext: null,
    cachedSurfacePointer: null,
    contextId: null,
    cachedSurface: null,
    cachedCanvas: null,
  });

  const createContext = useCallback(
    (currentContextId?: number) => {
      "worklet";

      if (currentContextId != null) {
        state.value.contextId = currentContextId;
      }
      const nativeSurface = getNativeSurface(state.value.contextId!);

      // this might only happen on unmount
      if (!nativeSurface?.surface) {
        return;
      }

      state.value.cachedSurfacePointer = nativeSurface.surface;
      state.value.skiaContext = Skia.Context(
        nativeSurface.surface,
        nativeSurface.width * ratio,
        nativeSurface.height * ratio
      );
    },
    [state]
  );

  useEffect(() => {
    if (context) {
      const currentContextId = ref.current!.getContextId();

      runOnUI(createContext)(currentContextId);
    }
  }, [context, createContext, ref]);

  const makeEmptySurface = useCallback(() => {
    "worklet";

    return {
      present: () => {},
      current: null,
      changed: false,
      canvas: null,
    };
  }, []);

  const getSurface = useCallback(() => {
    "worklet";

    if (!state.value.skiaContext || !state.value.contextId) {
      return makeEmptySurface();
    }

    const currentSurface = getNativeSurface(state.value.contextId);

    const contextChanged =
      currentSurface.surface !== state.value.cachedSurfacePointer;

    if (contextChanged) {
      if (state.value.cachedSurface) {
        state.value.cachedSurface.dispose();
      }

      state.value.changed = true;

      // we have to wait here for 2 frames otherwise it will be a black frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          state.value.changed = false;
        });
      });

      createContext();

      state.value.cachedSurface = null;
      state.value.cachedCanvas = null;
    }

    if (!state.value.cachedSurface) {
      const surface = state.value.skiaContext.getSurface();

      if (!surface) {
        return makeEmptySurface();
      }

      const canvas = surface.getCanvas();

      canvas.scale(ratio, ratio);

      state.value.cachedSurface = surface;
      state.value.cachedCanvas = canvas;
    }

    return {
      current: state.value.cachedSurface,
      canvas: state.value.cachedCanvas,
      changed: state.value.changed,
      present: () => state.value.skiaContext?.present(),
    };
  }, [state, createContext, makeEmptySurface]);

  return { ref, getSurface };
}

export function useOnscreenCanvas(
  callback: (ctx: SkCanvas, state: OnscreenCanvasState) => boolean
): [React.RefObject<CanvasRef>, () => void] {
  const { ref, getSurface } = useSkiaContext();

  const running = useSharedValue(true);

  const renderLoop = useCallback(() => {
    "worklet";

    const { canvas, present } = getSurface();

    if (!canvas) {
      return;
    }

    const shouldUpdate = callback(canvas!, {
      forceRerender: getSurface()?.changed,
    });

    if (shouldUpdate) {
      // dispose the previous texture so we don't leak memory
      present();
    }
  }, [callback, getSurface]);

  const stopOnscreenRendering = useCallback(() => {
    "worklet";

    running.value = false;

    getSurface()?.current?.dispose();
  }, [running, getSurface]);

  useEffect(() => {
    runOnUI(() => {
      "worklet";

      const frame = () => {
        "worklet";
        if (!running.value) {
          return;
        }

        renderLoop();

        global.requestAnimationFrame(frame);
      };

      frame();
    })();

    return () => {
      runOnUI(stopOnscreenRendering)();
    };
  }, [renderLoop, stopOnscreenRendering, running]);

  return [ref, stopOnscreenRendering];
}
