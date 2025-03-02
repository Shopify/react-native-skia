const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');
const fs = require('fs');

// Find all node_modules directories
const findNodeModules = (base) => {
  const nodeModulesPath = path.join(base, 'node_modules');
  const result = [nodeModulesPath];
  
  if (fs.existsSync(nodeModulesPath)) {
    const reactNativeDir = path.join(nodeModulesPath, 'react-native');
    if (fs.existsSync(reactNativeDir)) {
      result.push(path.join(reactNativeDir, 'node_modules'));
    }
  }
  
  return result;
};

// Define paths
const monorepoRoot = path.resolve(__dirname, '../..');
const projectRoot = __dirname;

// Get all node_modules paths
const nodeModulesPaths = [
  ...findNodeModules(projectRoot),
  ...findNodeModules(monorepoRoot),
];

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [
    // Watchfolders for monorepo
    path.resolve(monorepoRoot, 'node_modules'),
    path.resolve(monorepoRoot, 'packages'),
  ],
  resolver: {
    nodeModulesPaths,
    extraNodeModules: {
      // Instead of directly referencing the path, let Metro use the workspace reference
      // to avoid duplicate module issues
      '@shopify/react-native-skia': path.resolve(monorepoRoot, 'packages/skia/src'),
      // Ensure codegen is properly resolved
      '@react-native/codegen': path.resolve(monorepoRoot, 'node_modules/@react-native/codegen'),
      // Make sure react-native is correctly resolved from the root
      'react-native': path.resolve(monorepoRoot, 'node_modules/react-native'),
      'react': path.resolve(monorepoRoot, 'node_modules/react'),
      'react-native-reanimated': path.resolve(monorepoRoot, 'node_modules/react-native-reanimated'),
    },
    // Prevent errors with native modules
    disableHierarchicalLookup: false,
    // Enable resolving symlinks properly
    enableResolverCache: false,
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
