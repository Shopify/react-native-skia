import "@expo/metro-runtime";
import { LoadSkiaWeb } from "@shopify/react-native-skia/src/web";
import { version } from "canvaskit-wasm/package.json";
import { App } from "expo-router/build/qualified-entry";
import { renderRootComponent } from "expo-router/build/renderRootComponent";

LoadSkiaWeb({
	locateFile: (file) =>
		`https://cdn.jsdelivr.net/npm/canvaskit-wasm@${version}/bin/full/${file}`,
}).then(async () => {
	renderRootComponent(App);
});
