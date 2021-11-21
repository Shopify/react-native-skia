import CanvasKitInit from "canvaskit-wasm";
import type { CanvasKit } from "canvaskit-wasm";
import type { ReactNode } from "react";
import { useMemo, useContext, createContext, useState, useEffect } from "react";
import { delayRender, useCurrentFrame } from "remotion";

type RenderingContext = number | null;
export const RenderingContext = createContext<RenderingContext>(null);

export const useRendering = () => {
  const ctx = useContext(RenderingContext);
  if (ctx === null) {
    throw new Error("No rendering handle available");
  }
  return ctx;
};

type CanvasKitContext = CanvasKit | null;
export const CanvasKitContext = createContext<CanvasKitContext | null>(null);

export const useCanvasKit = () => {
  const CanvasKit = useContext(CanvasKitContext);
  if (!CanvasKit) {
    throw new Error("CanvasKit is not set yet");
  }
  return CanvasKit;
};

interface CanvasKitProviderProps {
  children: ReactNode | ReactNode[];
}

export const CanvasKitProvider = ({ children }: CanvasKitProviderProps) => {
  const frame = useCurrentFrame();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handle = useMemo(() => delayRender(), [frame]);
  const [CanvasKit, setCanvaskit] = useState<CanvasKit | null>(null);
  useEffect(() => {
    CanvasKitInit().then((ck) => {
      setCanvaskit(ck);
    });
  }, []);
  return (
    <RenderingContext.Provider value={handle}>
      <CanvasKitContext.Provider value={CanvasKit}>
        {CanvasKit && children}
      </CanvasKitContext.Provider>
    </RenderingContext.Provider>
  );
};
