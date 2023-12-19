/**
 * @format
 */
if (!Symbol.dispose) {
  Symbol.dispose = Symbol.for("Symbol.dispose");
}

import { AppRegistry } from "react-native";

import App from "./src/App";
import { name as appName } from "./app.json";

AppRegistry.registerComponent(appName, () => App);
