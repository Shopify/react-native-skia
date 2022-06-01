import { AppRegistry } from "react-native";
import { canvasKitPromise } from "@shopify/react-native-skia";

if (module.hot) {
  module.hot.accept();
}

canvasKitPromise.then(async () => {
  const App = (await import("./src/App")).default;
  const appInfo = (await import("./app.json")).default;
  AppRegistry.registerComponent(appInfo.name, () => App);
  AppRegistry.runApplication(appInfo.name, {
    initialProps: {},
    rootTag: document.getElementById("app-root"),
  });
});
