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

// Render every <Canvas> with Canvas2 (requires the Graphite backend).
// ci-graphite.yml flips this flag to true before starting Metro.
setCanvas2AsDefault(false);

AppRegistry.registerComponent(appName, () => App);
