import type {
  SkData,
  SkImage,
  SkTypeface,
  SkTypefaceFontProvider,
} from "@shopify/react-native-skia";
import { Canvas as SkCanvas, Skia } from "@shopify/react-native-skia";
import type { ReactNode } from "react";
import { useContext, createContext, useState, useEffect } from "react";
import { Internals } from "remotion";
import type { Font } from "opentype.js";
import opentype from "opentype.js";

import { CANVAS } from "./Theme";

type ImagesToLoad = Record<string, ReturnType<typeof require>>;
type TypefacesToLoad = Record<string, ReturnType<typeof require>>;
type Images = Record<string, SkImage>;
type TypeFaces = Record<string, SkTypeface>;
type Fonts = Record<string, Font>;

interface AssetManagerContext {
  images: Images;
  typefaces: TypeFaces;
  fonts: Fonts;
  fMgr: SkTypefaceFontProvider;
}

const AssetManagerContext = createContext<AssetManagerContext | null>(null);

interface RemotionCanvasProps {
  images: ImagesToLoad;
  typefaces: TypefacesToLoad;
  children: ReactNode | ReactNode[];
  width?: number;
  height?: number;
}

const useAssetManager = () => {
  const assetManager = useContext(AssetManagerContext);
  if (!assetManager) {
    throw new Error("Could not find the asset manager");
  }
  return assetManager;
};

export const useFontMgr = () => {
  const assetManager = useAssetManager();
  return assetManager.fMgr;
};

export const useOpenTypeFonts = () => {
  const assetManager = useAssetManager();
  return assetManager.fonts;
};

export const useTypefaces = () => {
  const assetManager = useAssetManager();
  return assetManager.typefaces;
};

export const useImages = () => {
  const assetManager = useAssetManager();
  return assetManager.images;
};

const resolveAsset = async <T,>(
  type: "image" | "typeface",
  name: string,
  asset: ReturnType<typeof require>,
  factory: (data: SkData) => T
) => {
  const data = await Skia.Data.fromURI(asset);
  return {
    type,
    name,
    data: factory(data),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    raw: (data as any).ref as Buffer,
  };
};

export const Canvas = ({
  children,
  images: imagesToLoad,
  typefaces: typefacesToLoad,
  width = CANVAS.width,
  height = CANVAS.height,
}: RemotionCanvasProps) => {
  const contexts = Internals.useRemotionContexts();
  const [assetMgr, setAssetMgr] = useState<AssetManagerContext | null>(null);
  useEffect(() => {
    (async () => {
      const fMgr = Skia.TypefaceFontProvider.Make();
      const assets = await Promise.all([
        ...Object.keys(imagesToLoad).map((name) =>
          resolveAsset("image", name, imagesToLoad[name], (data: SkData) =>
            Skia.Image.MakeImageFromEncoded(data)
          )
        ),
        ...Object.keys(typefacesToLoad).map((name) =>
          resolveAsset(
            "typeface",
            name,
            typefacesToLoad[name],
            (data: SkData) => Skia.Typeface.MakeFreeTypeFaceFromData(data)
          )
        ),
      ]);
      const images: Images = {};
      const typefaces: TypeFaces = {};
      const fonts: Fonts = {};
      assets.forEach((asset) => {
        if (asset.type === "image") {
          images[asset.name] = asset.data as SkImage;
        } else {
          const tf = asset.data as SkTypeface;
          typefaces[asset.name] = tf;
          fonts[asset.name] = opentype.parse(asset.raw);
          fMgr.registerFont(tf, asset.name);
        }
      });
      setAssetMgr({ images, typefaces, fonts, fMgr });
    })();
  }, [imagesToLoad, typefacesToLoad]);
  if (assetMgr === null) {
    return null;
  }
  return (
    <SkCanvas style={{ width, height }}>
      <Internals.RemotionContextProvider contexts={contexts}>
        <AssetManagerContext.Provider value={assetMgr}>
          {children}
        </AssetManagerContext.Provider>
      </Internals.RemotionContextProvider>
    </SkCanvas>
  );
};
