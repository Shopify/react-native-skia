import { AppRegistry } from "react-native";
import { LoadSkiaWeb } from "@shopify/react-native-skia/src/web";

import { name as appName } from "./app.json";

const rootTag = document.getElementById("root");

if (process.env.NODE_ENV !== "production") {
  if (!rootTag) {
    throw new Error(
      'Required HTML element with id "root" was not found in the document HTML.'
    );
  }
}

LoadSkiaWeb({
  locateFile: () => "/canvaskit.wasm",
}).then(async () => {
  const { default: App } = await import("./src/App");
  AppRegistry.registerComponent(appName, () => App);
  AppRegistry.runApplication(appName, { rootTag });
});
