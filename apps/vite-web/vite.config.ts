import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { flowPlugin, esbuildFlowPlugin } from '@bunchtogether/vite-plugin-flow';

const extensions = [
  ".web.mjs",
  ".web.js",
  ".web.mts",
  ".web.ts",
  ".web.jsx",
  ".web.tsx",
  ".mjs",
  ".js",
  ".mts",
  ".ts",
  ".jsx",
  ".tsx",
  ".json",
];

// https://vite.dev/config/
export default defineConfig({
  define: {
    global: "self",
    __DEV__: JSON.stringify(process.env.NODE_ENV === "development"),
    DEV: JSON.stringify(process.env.NODE_ENV === "development"),
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    "process.env": JSON.stringify({}),
  },
  plugins: [
    flowPlugin(),
    react({
      babel: {
        plugins: [
          "@babel/plugin-proposal-export-namespace-from",
          "react-native-reanimated/plugin",
        ],
      },
    }),
  ],
  resolve: {
    extensions,
    alias: [
      { find: "react-native/Libraries/Image/AssetRegistry", replacement: "@react-native/assets-registry/registry" },
      { find: "react-native", replacement: "react-native-web" },
    ],
  },
  optimizeDeps: {
    esbuildOptions: {
      resolveExtensions: extensions,
      plugins: [esbuildFlowPlugin()],
    },
  },
});
