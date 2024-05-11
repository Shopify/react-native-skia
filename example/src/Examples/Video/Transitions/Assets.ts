import { useAssets as useAssetsExpo } from "expo-asset";

export const useAssets = () => {
  const mods = [
    require("../../../assets/videos/bunny.mp4"),
    require("../../../assets/videos/bunny.mp4"),
    require("../../../assets/videos/bunny.mp4"),
    require("../../../assets/videos/bunny.mp4"),
    require("../../../assets/videos/bunny.mp4"),
    require("../../../assets/videos/bunny.mp4"),
    require("../../../assets/videos/bunny.mp4"),
  ];
  const [assets, error] = useAssetsExpo(mods);
  if (error) {
    throw error;
  }
  return assets ? assets.map((asset) => asset.localUri) : null;
};
