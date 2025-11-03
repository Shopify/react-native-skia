import { AppRegistry } from "react-native";

import App from "./src/App";
import { name as appName } from "./app.json";

if (!Symbol.dispose) {
  Symbol.dispose = Symbol.for("Symbol.dispose");
}

AppRegistry.registerComponent(appName, () => App);

if (typeof document !== "undefined") {
  const rootTag =
    document.getElementById("root") ?? document.getElementById("app");
  if (!rootTag) {
    throw new Error(
      'React Native Web root element with id "root" was not found in the document',
    );
  }
  AppRegistry.runApplication(appName, { rootTag });
}
