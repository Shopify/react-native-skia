import React, { useState, createContext, useEffect, useContext } from "react";
import { Image } from "react-native";
import type { SkImage, Data, SkTypeface } from "@shopify/react-native-skia";
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

type Sources = { [name: string]: ReturnType<typeof require> };

interface AssetProviderProps {
  typefaces: Sources;
  images: Sources;
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

const load = async <T,>(
  sources: Sources,
  factory: (data: Data) => T | null
) => {
  const data = await Promise.all(
    Object.entries(sources).map(([name, src]) => {
      return Skia.Data.fromURI(Image.resolveAssetSource(src).uri).then(
        (typeface) => {
          return {
            [name]: factory(typeface)!,
          };
        }
      );
    })
  );
  return data.reduce<{ [name: string]: T }>((r, i) => Object.assign(r, i), {});
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
        setTypeFaces(
          await load(typefaceSources, Skia.Typeface.MakeFreeTypeFaceFromData)
        );
      }
      if (images === null) {
        setImages(await load(imagesSources, Skia.MakeImageFromEncoded));
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
