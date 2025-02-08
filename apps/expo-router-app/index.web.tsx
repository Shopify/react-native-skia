import "@expo/metro-runtime";
import { App } from "expo-router/build/qualified-entry";
import { renderRootComponent } from "expo-router/build/renderRootComponent";
import { version } from 'canvaskit-wasm/package.json';

import { LoadSkiaWeb } from "@shopify/react-native-skia/src/web";

LoadSkiaWeb({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/canvaskit-wasm@${version}/bin/full/${file}` }).then(async () => {
	renderRootComponent(App);
});
