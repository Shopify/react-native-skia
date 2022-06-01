import { AppRegistry } from "react-native";
import CanvasKitInit from "canvaskit-wasm";

if (module.hot) {
  module.hot.accept();
}

console.log("*** Loading CanvasKit");
CanvasKitInit({}).then(async (canvasKit) => {
  console.log("*** CanvasKit loaded successfully");
  global.CanvasKit = canvasKit;
  const App = (await import("./src/App")).default;
  const appInfo = await import("./app.json");
  AppRegistry.registerComponent(appInfo.name, () => App);
  AppRegistry.runApplication(appInfo.name, {
    initialProps: {},
    rootTag: document.getElementById("app-root"),
  });
});
