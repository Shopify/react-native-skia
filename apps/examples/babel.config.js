module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@shopify/react-native-skia': '../../packages/skia/src',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
