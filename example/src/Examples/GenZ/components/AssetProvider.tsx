import React, { useState, createContext, useEffect, useContext } from "react";
import { Image } from "react-native";
import type { SkTypeface } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";
import type { ReactNode } from "react";

interface Typefaces {
  [name: string]: SkTypeface;
}

interface AssetContext {
  typefaces: Typefaces;
}

const AssetContext = createContext<AssetContext>({ typefaces: {} });

interface AssetProviderProps {
  typefaces: { [name: string]: ReturnType<typeof require> };
  children?: ReactNode | ReactNode[];
}

export const useFont = (name: string, size: number) => {
  const { typefaces } = useContext(AssetContext);
  if (!typefaces[name]) {
    throw new Error(`No typeface named ${name}`);
  }
  return Skia.Font(typefaces[name], size);
};

export const AssetProvider = ({
  typefaces: typefaceSources,
  children,
}: AssetProviderProps) => {
  const [typefaces, setTypeFaces] = useState<null | Typefaces>(null);
  useEffect(() => {
    (async () => {
      const data = await Promise.all(
        Object.entries(typefaceSources).map(([name, src]) => {
          return Skia.Data.fromURI(Image.resolveAssetSource(src).uri).then(
            (typeface) => {
              return {
                [name]: Skia.Typeface.MakeFreeTypeFaceFromData(typeface),
              };
            }
          );
        })
      );
      setTypeFaces(data.reduce<Typefaces>((r, i) => Object.assign(r, i), {}));
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
