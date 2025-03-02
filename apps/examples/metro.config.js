const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [
    // Watchfolders for monorepo
    path.resolve(__dirname, '../../node_modules'),
    path.resolve(__dirname, '../../packages'),
  ],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../node_modules'),
    ],
    extraNodeModules: {
      // Alias for monorepo packages
      '@shopify/react-native-skia': path.resolve(__dirname, '../../packages/skia'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
