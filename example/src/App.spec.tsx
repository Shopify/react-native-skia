import "react-native";
import React from "react";
// Test renderer must be required after react-native.
import { cleanup, render } from "@testing-library/react-native";

import App from "./App";

jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");

  // The mock for `call` immediately calls the callback which is incorrect
  // So we override it with a no-op
  Reanimated.default.call = () => {};

  return Reanimated;
});

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

jest.mock("@shopify/react-native-skia", () => {
  return require("../../package/src/mock").Mock;
});

it("renders correctly", () => {
  render(<App />);
});

afterEach(cleanup);
