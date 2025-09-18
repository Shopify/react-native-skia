/* globals jest */
const JestUtils = require("react-native-reanimated/lib/module/jestUtils");
const MockReanimated = require("react-native-reanimated/mock");

JestUtils.setUpTests();
global.__reanimatedWorkletInit = () => {};

jest.mock("expo-asset", () => ({
  useAssets: () => [[], undefined],
}));

jest.mock("react-native-reanimated", () => {
  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  MockReanimated.default.call = () => {};
  MockReanimated.Extrapolation = {
    CLAMP: "clamp",
  };
  MockReanimated.useEvent = () => {};
  MockReanimated.scrollTo = () => {};
  MockReanimated.useFrameCallback = () => {};
  MockReanimated.convertToRGBA = () => {};
  return MockReanimated;
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

jest.mock("react-native-gesture-handler", () => {
  return {
    ...jest.requireActual("react-native-gesture-handler"),
    GestureDetector: jest.fn(),
  };
});

jest.mock("@react-native-community/slider", () => "Slider");

jest.mock("react-native-screens", () => ({
  ...jest.requireActual("react-native-screens"),
  enableScreens: jest.fn(),
  Screen: ({ children }) => children,
}));
