import { WithSkiaWeb } from "@shopify/react-native-skia/src/web";

function App() {
  return (
    <WithSkiaWeb
      getComponent={() => import("./SkiaApp")}
      fallback={null}
      opts={{ locateFile: () => `/canvaskit.wasm` }}
    />
  );
}

export default App;
