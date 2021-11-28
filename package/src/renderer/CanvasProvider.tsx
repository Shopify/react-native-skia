import type { ReactNode } from "react";
import { createContext, useContext } from "react";

interface CanvasContext {
  width: number;
  height: number;
}

const CanvasContext = createContext<CanvasContext | null>(null);

export const useCanvas = () => {
  const ctx = useContext(CanvasContext);
  if (ctx === null) {
    throw new Error(
      "CanvasProvider not found. Are you using this hook in the Skia rendering context?"
    );
  }
  return ctx;
};

interface CanvasProviderProps {
  children: ReactNode | ReactNode[];
  width: number;
  height: number;
}

export const CanvasProvider = ({
  children,
  width,
  height,
}: CanvasProviderProps) => {
  return (
    <CanvasContext.Provider value={{ width, height }}>
      {children}
    </CanvasContext.Provider>
  );
};
