import { useState, useEffect } from "react";

import { Skia } from "../Skia";

import type { Typeface } from "./Typeface";

const resolveAsset = require("react-native/Libraries/Image/resolveAssetSource");

/**
 * Returns a Skia Typeface object
 * */
export const useTypeface = (source: ReturnType<typeof require>) => {
  const [typeface, setTypeface] = useState<Typeface | null>(null);
  useEffect(() => {
    Skia.Typeface(resolveAsset(source).uri).then(setTypeface);
  }, [source]);
  return typeface;
};
