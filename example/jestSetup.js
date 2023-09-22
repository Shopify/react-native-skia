require("react-native-reanimated/lib/module/reanimated2/jestUtils").setUpTests();
global.__reanimatedWorkletInit = () => {};
jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");

  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {};
  Reanimated.Extrapolation = {
    CLAMP: "clamp",
  };
  Reanimated.useEvent = () => {};
  Reanimated.scrollTo = () => {};
  return Reanimated;
});
// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

jest.mock("@shopify/react-native-skia", () => {
  jest.mock("../package/src/Platform", () => {
    const Noop = () => undefined;
    return {
      OS: "web",
      PixelRatio: 1,
      requireNativeComponent: Noop,
      resolveAsset: Noop,
      findNodeHandle: Noop,
      NativeModules: Noop,
      View: Noop,
    };
  });
  return require("../package/src/mock").Mock(global.CanvasKit);
});

const mockedNavigate = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockedNavigate,
    }),
  };
});
