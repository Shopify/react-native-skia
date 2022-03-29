import React, { useState, createContext, useEffect, useContext } from "react";
import { Image } from "react-native";
import type { SkImage, SkTypeface } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";
import type { ReactNode } from "react";

interface Typefaces {
  [name: string]: SkTypeface;
}

interface Images {
  [name: string]: SkImage;
}

interface AssetContext {
  typefaces: Typefaces;
  images: Images;
}

const AssetContext = createContext<AssetContext>({ typefaces: {}, images: {} });

interface AssetProviderProps {
  typefaces: { [name: string]: ReturnType<typeof require> };
  images: { [name: string]: ReturnType<typeof require> };
  children?: ReactNode | ReactNode[];
}

export const useFont = (name: string, size: number) => {
  const { typefaces } = useContext(AssetContext);
  if (!typefaces[name]) {
    throw new Error(`No typeface named ${name}`);
  }
  return Skia.Font(typefaces[name], size);
};

export const useImages = () => {
  const { images } = useContext(AssetContext);
  return images;
};

export const AssetProvider = ({
  typefaces: typefaceSources,
  images: imagesSources,
  children,
}: AssetProviderProps) => {
  const [typefaces, setTypeFaces] = useState<null | Typefaces>(null);
  const [images, setImages] = useState<null | Images>(null);
  useEffect(() => {
    (async () => {
      if (typefaces === null) {
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
      }
      if (images === null) {
        const data = await Promise.all(
          Object.entries(imagesSources).map(([name, src]) => {
            return Skia.Data.fromURI(Image.resolveAssetSource(src).uri).then(
              (img) => {
                return {
                  [name]: Skia.MakeImageFromEncoded(img)!,
                };
              }
            );
          })
        );
        setImages(data.reduce<Images>((r, i) => Object.assign(r, i), {}));
      }
    })();
  }, [images, imagesSources, typefaceSources, typefaces]);
  if (typefaces === null || images === null) {
    return null;
  }
  return (
    <AssetContext.Provider value={{ typefaces, images }}>
      {children}
    </AssetContext.Provider>
  );
};
