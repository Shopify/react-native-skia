import type { ImageSourcePropType } from "react-native";
import { useState, useEffect } from "react";

import type { IImage } from "./Image";
import { ImageCtor } from "./Image";

const isImage = (image: unknown): image is IImage => typeof image === "object";

/**
 * Returns a Skia Image object
 * */
export const useImage = (source: ImageSourcePropType | IImage) => {
  const [image, setImage] = useState<IImage | null>(null);
  useEffect(() => {
    if (isImage(source)) {
      setImage(source);
    } else {
      ImageCtor(source).then((value) => {
        setImage(value);
      });
    }
  }, [source]);
  return image;
};
