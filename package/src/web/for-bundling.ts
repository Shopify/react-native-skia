// This file can get bundled with package/build.ts
// and two versions will get generated:
// @Shopify/react-native-skia/web -> A Pure JS version with no webpack override necessary
// @Shopify/react-native-skia/react-native-web ->
//   A React Native Web version
//   that supports React Native assets but
//   but needs a react-native-web Webpack override

export * from "./LoadSkiaWeb";
export * from "./WithSkiaWeb";
export * from "../index";
