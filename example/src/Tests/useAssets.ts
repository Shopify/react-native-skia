import { useImage, useTypeface } from "@shopify/react-native-skia";

export const useAssets = () => {
  const oslo = useImage(require("./assets/oslo.jpg"));
  const typeface = useTypeface(require("./assets/Roboto-Medium.ttf"));
  if (!typeface || !oslo) {
    return null;
  }
  return { "Roboto-Medium": typeface, oslo: oslo };
};
