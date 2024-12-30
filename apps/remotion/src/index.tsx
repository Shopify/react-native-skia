/* eslint-disable no-var */
// This is your entry file! Refer to it when you render:
// npx remotion render <entry-file> HelloWorld out/video.mp4
import { LoadSkia } from "@shopify/react-native-skia/src/web/LoadSkiaWeb";
import { registerRoot } from "remotion";

(async () => {
  await LoadSkia();
  const { RemotionVideo } = await import("./Video");
  registerRoot(RemotionVideo);
})();
