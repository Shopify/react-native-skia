import { useImage, useTypeface } from "@shopify/react-native-skia";
import { useCallback, useState } from "react";

export const useAssets = () => {
  const [error, setError] = useState<Error | null>(null);
  const errorHandler = useCallback((e: Error) => setError(e), []);
  const oslo = useImage(require("./assets/oslo.jpg"), errorHandler);
  const RobotoMedium = useTypeface(
    require("./assets/Roboto-Medium.ttf"),
    errorHandler
  );
  const NotoColorEmoji = useTypeface(
    require("./assets/NotoColorEmoji.ttf"),
    errorHandler
  );
  if (error) {
    throw new Error("Failed to load assets: " + error.message);
  }
  if (!RobotoMedium || !oslo || !NotoColorEmoji) {
    return null;
  }
  return { RobotoMedium, NotoColorEmoji, oslo };
};
