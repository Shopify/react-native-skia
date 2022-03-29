import React, { useState, createContext, useEffect } from "react";
import type { ITypeface } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";
import type { ReactNode } from "react";

interface Typefaces {
  [name: string]: ITypeface;
}

interface AssetContext {
  typefaces: Typefaces;
}

const AssetContext = createContext<AssetContext>({ typefaces: {} });

interface AssetProviderProps {
  typefaces: { [name: string]: ReturnType<typeof require> };
  children?: ReactNode | ReactNode[];
}

export const AssetProvider = ({
  typefaces: typefaceSources,
  children,
}: AssetProviderProps) => {
  const [typefaces, setTypeFaces] = useState<null | Typefaces>(null);
  useEffect(() => {
    (async () => {
      const tfs = Promise.all(
        typefaceSources.map((tf) => Skia.Font.loadTypeface(tf))
      );
    })();
  }, [typefaceSources]);
  if (typefaces === null) {
    return null;
  }
  return (
    <AssetContext.Provider value={{ typefaces }}>
      {children}
    </AssetContext.Provider>
  );
};
