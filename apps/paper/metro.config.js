const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const root = path.resolve(__dirname, '../..');

const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.assetExts.push('glb', 'gltf', 'jpg', 'bin', 'hdr', 'ttf', 'otf', 'png');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [root],

  resolver: {
    extraNodeModules: {
    },
    resolveRequest: (context, moduleName, platform) => {
      // Let Metro handle other modules
      return context.resolveRequest(context, moduleName, platform);
    },
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },

  watchFolders: [
    root
  ],
  
  resolver: {
    blockList: exclusionList([
      new RegExp(`${path.resolve(root, 'externals')}.*`)
    ])
  }
};

module.exports = mergeConfig(defaultConfig, config);
