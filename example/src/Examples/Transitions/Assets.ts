import { useImage } from "@shopify/react-native-skia";

export const useAssets = () => {
  const image1 = useImage(require("./assets/2.jpg"));
  const image2 = useImage(require("./assets/4.jpg"));
  const image3 = useImage(require("./assets/9.jpg"));
  const image4 = useImage(require("./assets/10.jpg"));
  const image5 = useImage(require("./assets/11.jpg"));
  const image6 = useImage(require("./assets/12.jpg"));
  if (!image1 || !image2 || !image3 || !image4 || !image5 || !image6) {
    return null;
  }
  return [image1, image2, image3, image4, image5, image6];
};
