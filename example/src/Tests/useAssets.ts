import { useImage, useTypeface } from "@shopify/react-native-skia";
import { useCallback, useState } from "react";
import { Platform } from "react-native";

const SkiaLogo =
  Platform.OS === "web" ? require("./assets/skia_logo.png") : "skia_logo";
const SkiaLogoJpeg =
  Platform.OS === "web"
    ? require("./assets/skia_logo_jpeg.jpg")
    : "skia_logo_jpeg";

// NotoColorEmoji.ttf is only available on iOS
const NotoColorEmojiSrc =
  Platform.OS === "ios"
    ? require("./assets/Roboto-Medium.ttf")
    : require("./assets/NotoColorEmoji.ttf");

export const useAssets = () => {
  const [error, setError] = useState<Error | null>(null);
  const errorHandler = useCallback((e: Error) => setError(e), []);
  const oslo = useImage(require("./assets/oslo.jpg"), errorHandler);
  const skiaLogoJpeg = useImage(SkiaLogoJpeg, errorHandler);
  const skiaLogoPng = useImage(SkiaLogo, errorHandler);
  const RobotoMedium = useTypeface(
    require("./assets/Roboto-Medium.ttf"),
    errorHandler
  );
  const NotoColorEmoji = useTypeface(NotoColorEmojiSrc, errorHandler);
  const NotoSansSCRegular = useTypeface(
    require("./assets/NotoSansSC-Regular.otf"),
    errorHandler
  );
  if (error) {
    throw new Error("Failed to load assets: " + error.message);
  }
  if (
    !RobotoMedium ||
    !oslo ||
    !NotoColorEmoji ||
    !NotoSansSCRegular ||
    !skiaLogoJpeg ||
    !skiaLogoPng
  ) {
    return null;
  }
  return {
    RobotoMedium,
    NotoColorEmoji,
    NotoSansSCRegular,
    oslo,
    skiaLogoJpeg,
    skiaLogoPng,
  };
};
