/**
 * @format
 */
import { AppRegistry } from "react-native";
import { setCanvas2AsDefault } from "@shopify/react-native-skia";

import App from "./src/App";
import { name as appName } from "./app.json";

if (!Symbol.dispose) {
  Symbol.dispose = Symbol.for("Symbol.dispose");
}

// Debug: render every <Canvas> with Canvas2 (requires the Graphite backend).
setCanvas2AsDefault(true);

AppRegistry.registerComponent(appName, () => App);
