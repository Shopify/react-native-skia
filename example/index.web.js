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

const loadTypeface = (mod) =>
  fetch(mod.default).then((response) => response.arrayBuffer());

Promise.all([
  LoadSkia(),
  loadTypeface(require("./src/Tests/assets/Roboto-Medium.ttf")),
]).then(async ([, Roboto]) => {
  //const SkiaModule = await import("@shopify/react-native-skia");
  const App = (await import("./src/App")).default;
  const appInfo = await import("./app.json");
  AppRegistry.registerComponent(appInfo.name, () => App);
  AppRegistry.runApplication(appInfo.name, {
    initialProps: {},
    rootTag: document.getElementById("app-root"),
  });
});
