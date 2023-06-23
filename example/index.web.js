import { AppRegistry } from "react-native";
// TODO: we might have this a simple JS file so it's the same URL from the dev or production package
import { LoadSkia } from "@shopify/react-native-skia/src/web";

globalThis.setImmediate = requestAnimationFrame;
globalThis.process = {
  env: {
    CI: "false",
  },
};

if (module.hot) {
  module.hot.accept();
}

LoadSkia().then(async () => {
  const App = (await import("./src/App")).default;
  const appInfo = await import("./app.json");
  AppRegistry.registerComponent(appInfo.name, () => App);
  AppRegistry.runApplication(appInfo.name, {
    initialProps: {},
    rootTag: document.getElementById("app-root"),
  });
});
