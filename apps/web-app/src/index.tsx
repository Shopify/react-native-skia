import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import { LoadSkiaWeb } from "@shopify/react-native-skia/src/web";
//import { version } from 'canvaskit-wasm/package.json';


const version = "0.40.0";
LoadSkiaWeb({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/canvaskit-wasm@${version}/bin/full/${file}`
}).then(async () => {
  const App = (await import("./App")).default;
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
